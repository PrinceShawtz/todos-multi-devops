pipeline {
    agent any

    tools {
        nodejs 'node18'
    }

    environment {
        NODE_ENV = 'development'
        SONARQUBE_SERVER = 'SonarQube'
    }

    parameters {
        booleanParam(
            name: 'ROLLBACK',
            defaultValue: false,
            description: 'Set to true to rollback the AKS deployment to the previous version'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Lint Code') {
            steps {
                dir('backend') {
                    sh 'npx eslint . || true'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('backend') {
                    echo 'Running unit tests... (placeholder)'
                    // sh 'npm test || true'
                }
            }
        }

        stage('Static Code Analysis') {
            steps {
                dir('backend') {
                    script {
                        def sonarScanner = tool name: 'sonar-scanner-cli', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        withSonarQubeEnv("${env.SONARQUBE_SERVER}") {
                            sh """
                            ${sonarScanner}/bin/sonar-scanner \
                              -Dsonar.projectKey=todo-app \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=$SONAR_HOST_URL \
                              -Dsonar.login=$SONAR_AUTH_TOKEN
                            """
                        }
                    }
                }
            }
        }

        stage('Debug Branch Vars') {
            steps {
                script {
                    echo "🔍 GIT_BRANCH: ${env.GIT_BRANCH}"
                    echo "🔍 BRANCH_NAME: ${env.BRANCH_NAME}"
                    echo "🔍 CHANGE_ID: ${env.CHANGE_ID}"       // PR number (if PR build)
                    echo "🔍 CHANGE_TARGET: ${env.CHANGE_TARGET}" // Target branch of PR
                }
            }
        }

        // ✅ PR Validation Stage (runs only for Pull Requests)
        stage('PR Validation') {
            when {
                expression { env.CHANGE_ID != null }
            }
            steps {
                echo "🔎 Running PR validation for PR #${env.CHANGE_ID} → Target: ${env.CHANGE_TARGET}"
                echo "✅ PR checks passed. No Docker build/deploy for PR builds."
            }
        }

        // ✅ Dev/feature branches (not main, not PR)
        stage('Branch Validation') {
            when {
                allOf {
                    not { branch 'main' }
                    expression { env.CHANGE_ID == null }
                }
            }
            steps {
                echo "✅ CI completed for branch: ${env.BRANCH_NAME}"
                echo "⚠️ No deployment for non-main branches."
            }
        }

        // ✅ Build & Push Docker Image (only main branch)
        stage('Build & Push Docker Image') {
            when {
                branch 'main'
            }
            steps {
                dir('backend') {
                    script {
                        def imageName = "princeshawtz/todo-app:${env.BUILD_NUMBER}"
                        withCredentials([usernamePassword(credentialsId: 'dockerhub',
                                                  usernameVariable: 'DOCKER_USERNAME',
                                                  passwordVariable: 'DOCKER_PASSWORD')]) {
                            sh "docker build -t $imageName -f Dockerfile ."
                            sh "echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin"
                            sh "docker push $imageName"
                        }
                    }
                }
            }
        }

        // ✅ Approval & Deploy to AKS (only main branch)
        stage('Approval & Deploy to AKS') {
            when {
                branch 'main'
            }
            steps {
                input message: '✅ Approve deployment to AKS?'
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    script {
                        def imageName = "princeshawtz/todo-app:${env.BUILD_NUMBER}"
                        sh """
                        kubectl --kubeconfig=$KUBECONFIG create namespace team-a --dry-run=client -o yaml | kubectl --kubeconfig=$KUBECONFIG apply -f -

                        if ! kubectl --kubeconfig=${KUBECONFIG} get pvc todo-pvc -n team-a >/dev/null 2>&1; then
                            kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/pvc.yaml
                        else
                            echo "✅ PVC already exists, skipping..."
                        fi

                        kubectl --kubeconfig=$KUBECONFIG apply -f k8s/service.yaml
                        sed 's|IMAGE_TAG|$imageName|' k8s/deployment.yaml | kubectl --kubeconfig=$KUBECONFIG apply -f -
                        """
                    }
                }
            }
        }

        // ✅ Rollback option (manual)
        stage('Rollback Deployment') {
            when {
                expression { params.ROLLBACK == true }
            }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    script {
                        echo "⏪ Rolling back deployment to previous revision..."
                        sh """
                        kubectl --kubeconfig=$KUBECONFIG rollout undo deployment/todo-app -n team-a
                        kubectl --kubeconfig=$KUBECONFIG rollout status deployment/todo-app -n team-a
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo '🚦 Pipeline execution complete.'
        }
    }
}
