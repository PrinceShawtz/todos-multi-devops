pipeline {
    agent any

    tools {
        nodejs 'node18'
    }

    environment {
        // Set Node environment if needed
        NODE_ENV = 'development'
        // Replace with your actual SonarQube server name (as configured in Jenkins)
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
                    // Add tests later; placeholder for now
                    echo 'Running unit tests... (placeholder)'
                    // sh 'npm test || true'
                }
            }
        }

        stage('Static Code Analysis') {
            steps {
                dir('backend') {
                    script {
                        // Get the SonarQube Scanner tool configured in Jenkins
                        def sonarScanner = tool name: 'sonar-scanner-cli', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        withSonarQubeEnv("${env.SONARQUBE_SERVER}") {
                            sh "${sonarScanner}/bin/sonar-scanner -Dsonar.projectKey=todo-app -Dsonar.sources=. -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_AUTH_TOKEN"
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
                }
            }
        }

        stage('Build & Push Docker Image') {
            when {
                expression {
                    env.GIT_BRANCH == 'refs/remotes/origin/main' && !params.ROLLBACK
                }
            }
            steps {
                dir('backend') {
                    script {
                        def imageName = "princeshawtz/todo-app:${env.BUILD_NUMBER}"
                        sh "docker build -t $imageName ."
                        sh "echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin"
                        sh "docker push $imageName"
                    }
                }
            }
        }

        stage('Approval & Deploy to AKS') {
            when {
                expression {
                    env.GIT_BRANCH == 'refs/remotes/origin/main' && !params.ROLLBACK
                }
            }
            steps {
                input message: '✅ Approve deployment to AKS?'
                script {
                    def imageName = "princeshawtz/todo-app:${env.BUILD_NUMBER}"

                    sh """
                    kubectl config use-context aks-uk-dev-app
                    kubectl create namespace team-a --dry-run=client -o yaml | kubectl apply -f -
                    kubectl apply -f k8s/pvc.yaml
                    kubectl apply -f k8s/service.yaml

                    # Inject dynamic image tag into deployment
                    sed 's|IMAGE_TAG|$imageName|' k8s/deployment.yaml | kubectl apply -f -
                    """
                }
            }
        }
        
        stage('Rollback Deployment') {
            when {
                expression { params.ROLLBACK == true }
            }
            steps {
                script {
                    echo "⏪ Rolling back deployment to previous revision..."
                    try {
                        sh "kubectl rollout undo deployment/todo-app -n team-a"
                        sh "kubectl rollout status deployment/todo-app -n team-a"
                    } catch (err) {
                        echo "⚠️ Rollback failed: ${err}"
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
