pipeline {
  agent any

  environment {
    NODE_ENV = 'test'
    DATABASE_URL = 'postgresql://brain:brain@postgres:5432/brain_agriculture_test_db?schema=public'
    DOCKER_IMAGE = 'brain-agriculture-api'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Prisma generate') {
      steps {
        sh 'npx prisma generate'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint:check'
      }
    }

    stage('Unit tests and coverage') {
      steps {
        sh 'npm run test:cov'
      }
    }

    stage('Build application') {
      steps {
        sh 'npm run build'
      }
    }

    stage('SonarQube analysis') {
      when {
        expression {
          return env.SONAR_HOST_URL && env.SONAR_TOKEN
        }
      }
      steps {
        sh 'sonar-scanner'
      }
    }

    stage('Docker build') {
      steps {
        sh 'docker build -t $DOCKER_IMAGE:$BUILD_NUMBER .'
      }
    }

    stage('Publish Docker image to Nexus') {
      when {
        expression {
          return env.NEXUS_REGISTRY && env.NEXUS_REPOSITORY
        }
      }
      steps {
        sh '''
          docker tag $DOCKER_IMAGE:$BUILD_NUMBER $NEXUS_REGISTRY/$NEXUS_REPOSITORY/$DOCKER_IMAGE:$BUILD_NUMBER
          docker push $NEXUS_REGISTRY/$NEXUS_REPOSITORY/$DOCKER_IMAGE:$BUILD_NUMBER
        '''
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
    }
  }
}