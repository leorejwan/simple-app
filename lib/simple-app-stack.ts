import * as cdk from 'aws-cdk-lib';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path'
import {BucketDeployment, Source} from 'aws-cdk-lib/aws-s3-deployment';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SimpleAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const bucket = new Bucket(this, 'MySimpleAppBucket', {
      encryption: BucketEncryption.S3_MANAGED,
    });

    new BucketDeployment(this, 'MySimpleAppPhotos', {
      sources: [
        Source.asset(path.join(__dirname, '..', 'photos'))
      ],
      destinationBucket: bucket
    })

    const getPhotos = new lambda.Function(this, 'MySimpleAppLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      // code: lambda.Code.fromAsset(path.join(__dirname, '..', 'api', 'get-photos', 'index.ts')),
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'api', 'get-photos')),
      handler: 'index.handler',
      environment: {
        PHOTO_BUCKET_NAME: bucket.bucketName,
      }
    })

    const bucketContainerPermissions = new PolicyStatement();
    bucketContainerPermissions.addResources(bucket.bucketArn);
    bucketContainerPermissions.addActions('s3:ListBucket');

    const bucketPermissions = new PolicyStatement();
    bucketPermissions.addResources(`${bucket.bucketArn}/*`);
    bucketPermissions.addActions('s3:GetObject', 's3:PutObject');

    getPhotos.addToRolePolicy(bucketContainerPermissions);
    getPhotos.addToRolePolicy(bucketPermissions);


    new cdk.CfnOutput(this, 'MySimpleAppBucketNameExport', {
        value: bucket.bucketName,
        exportName: 'MySimpleAppBucketName',
    });

    // example resource
    // const queue = new sqs.Queue(this, 'SimpleAppQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
