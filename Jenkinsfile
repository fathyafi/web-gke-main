pipeline {
    agent any

    tools {
        nodejs 'Node 20.19.0'
        'hudson.plugins.sonar.SonarRunnerInstallation' 'SonarScanner'
    }

    environment {
        REGISTRY_URL                  = 'docker.io'
        FRONTEND_IMAGE                = 'fathyafi/fe-app-redhat:latest'
        OPENSHIFT_PROJECT             = 'fathyafi-dev'
        SONAR_QUBE_SERVER_URL         = 'https://sonar3am.42n.fun'
        SONAR_QUBE_PROJECT_KEY        = 'fe-app-sq-redhat'
        SONAR_QUBE_PROJECT_NAME       = 'Project SonarQube Frontend RedHat'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                dir('frontend') {
                    git branch: 'main', url: 'https://github.com/fathyafi/web-redhat-main.git'
                }
                echo 'Repository checked out successfully.'
            }
        }

        stage('Unit Test Frontend') {
            steps {
                dir('frontend') {
                    withCredentials([file(credentialsId: 'env-frontend-redhat', variable: 'env_file_redhat')]) {
                        sh '''
                            echo "env_file_redhat is: $env_file_redhat"
                            ls -l "$env_file_redhat"
                            cat "$env_file_redhat"
                            cp "$env_file_redhat" .env
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
                        // Get SonarScanner tool path - ini harus ada di dalam steps
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
                                echo 'SonarQube analysis completed.'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Image Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                    npm run build
                    docker build --no-cache -t $FRONTEND_IMAGE .
                '''
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh """
                            docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                            docker push ${FRONTEND_IMAGE}
                        """
                        echo 'Docker image pushed to Docker Hub.'
                    }
                }
            }
        }

        stage('Deploy to OpenShift (RedHat)') {
            steps {
                withCredentials([string(credentialsId: 'openshift-redhat-token',variable: 'OC_TOKEN')]) {
                sh '''
                    oc login --token=$OC_TOKEN --server=https://api.rm1.0a51.p1.openshiftapps.com:6443
                    oc project $OPENSHIFT_PROJECT
                '''
                dir('frontend/openshift') {
                    sh "oc apply -f deployment.yml"
                    sh "oc apply -f service.yml"
                    sh "oc apply -f route.yml"
                    sh "oc rollout restart deployment/frontend-app"
                }
                echo "Application deployed to OpenShift."
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline finished successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs for details.'
        }
    }
}