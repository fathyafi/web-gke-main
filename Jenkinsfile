pipeline {
    agent any

    tools {
        nodejs 'Node 20.19.0'
        'hudson.plugins.sonar.SonarRunnerInstallation' 'SonarScanner'
    }

    environment {
        PROJECT_ID             = 'am-finalproject'
        REGION                 = 'asia-southeast2'
        CLUSTER_NAME           = 'finalproject-cluster'
        IMAGE_NAME             = 'frontend-app'
        REPO_NAME              = 'fathya-frontend-repo'
        ARTIFACT_REGISTRY_URL  = 'asia-southeast2-docker.pkg.dev'
        IMAGE_URI              = "${ARTIFACT_REGISTRY_URL}/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:latest"
        SONAR_QUBE_SERVER_URL  = 'https://sonar3am.42n.fun'
        SONAR_QUBE_PROJECT_KEY = 'fe-app-sq-gke'
        SONAR_QUBE_PROJECT_NAME = 'Project SonarQube Frontend GKE'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                dir('frontend') {
                    git branch: 'main', url: 'https://github.com/fathyafi/web-gke-main.git'
                }
            }
        }

        stage('Unit Test') {
            steps {
                dir('frontend') {
                    withCredentials([file(credentialsId: 'env-frontend-gke', variable: 'ENV_FILE')]) {
                        sh '''
                            cp "$ENV_FILE" .env
                            npm install
                            npm test
                            rm .env
                        '''
                    }
                }
            }
        }

        stage('SAST with SonarQube') {
            steps {
                dir('frontend') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        withSonarQubeEnv('SonarQube') {
                            withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                                sh """
                                    ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=${SONAR_QUBE_PROJECT_KEY} \
                                    -Dsonar.projectName="${SONAR_QUBE_PROJECT_NAME}" \
                                    -Dsonar.host.url=${SONAR_QUBE_SERVER_URL} \
                                    -Dsonar.login=${SONAR_TOKEN} \
                                    -Dsonar.sources=. \
                                    -Dsonar.exclusions=node_modules/**,dist/**,build/**,coverage/**
                                """
                            }
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('frontend') {
                    withCredentials([file(credentialsId: 'env-frontend-gke', variable: 'ENV_FILE')]) {
                        sh '''
                            cp "$ENV_FILE" .env
                            export $(grep -v '^#' .env | xargs)

                            docker build --no-cache \
                                --build-arg VUE_APP_SERVICE_API=$VUE_APP_SERVICE_API \
                                --build-arg VUE_APP_FIREBASE_API_KEY=$VUE_APP_FIREBASE_API_KEY \
                                --build-arg VUE_APP_FIREBASE_AUTH_DOMAIN=$VUE_APP_FIREBASE_AUTH_DOMAIN \
                                --build-arg VUE_APP_FIREBASE_PROJECT_ID=$VUE_APP_FIREBASE_PROJECT_ID \
                                --build-arg VUE_APP_FIREBASE_STORAGE_BUCKET=$VUE_APP_FIREBASE_STORAGE_BUCKET \
                                --build-arg VUE_APP_FIREBASE_MESSAGING_SENDER_ID=$VUE_APP_FIREBASE_MESSAGING_SENDER_ID \
                                --build-arg VUE_APP_FIREBASE_APP_ID=$VUE_APP_FIREBASE_APP_ID \
                                --build-arg VUE_APP_FIREBASE_MEASUREMENT_ID=$VUE_APP_FIREBASE_MEASUREMENT_ID \
                                -t $IMAGE_URI .
                            rm .env
                        '''
                    }
                }
            }
        }

        stage('Push to Artifact Registry') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                    sh '''
                        gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
                        gcloud auth configure-docker ${ARTIFACT_REGISTRY_URL} --quiet
                        docker push $IMAGE_URI
                    '''
                }
            }
        }

        stage('Deploy to GKE') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                    sh '''
                        gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
                        gcloud config set project $PROJECT_ID
                        gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION

                        kubectl apply -f frontend/k8s/deployment.yml
                        kubectl apply -f frontend/k8s/service.yml
                        kubectl apply -f frontend/k8s/hpa.yml
                        kubectl rollout restart deployment/frontend-app
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline finished successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Please check the logs.'
        }
    }
}
