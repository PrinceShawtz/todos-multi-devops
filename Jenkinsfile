pipeline {
    agent any

    environment {
        // Set Node environment if needed
        NODE_ENV = 'development'
        // Replace with your actual SonarQube server name (as configured in Jenkins)
        SONARQUBE_SERVER = 'SonarQube'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint Code') {
            steps {
                sh 'npx eslint . || true'
            }
        }

        stage('Run Tests') {
            steps {
                // Add tests later; placeholder for now
                echo 'Running unit tests... (placeholder)'
                // sh 'npm test || true'
            }
        }

        stage('Static Code Analysis') {
            steps {
                withSonarQubeEnv("${env.SONARQUBE_SERVER}") {
                    sh 'npx sonar-scanner \
                        -Dsonar.projectKey=todo-app \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=$SONAR_HOST_URL \
                        -Dsonar.login=$SONAR_AUTH_TOKEN'
                }
            }
        }

        stage('Build & Push Docker Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def imageName = "princeshawtz/todo-app:${env.BUILD_NUMBER}"
                    sh "docker build -t $imageName ."
                    sh "echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin"
                    sh "docker push $imageName"
                }
            }
        }

        stage('Approval & Deploy to AKS') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Approve deployment to AKS?'
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
                    echo "Rolling back deployment to previous revision"
                    sh "kubectl rollout undo deployment/todo-app -n team-a"
                }
            }
        }

    }

    post {
        always {
            echo 'Pipeline execution complete.'
        }
    }
}
