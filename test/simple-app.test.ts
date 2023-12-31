import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as SimpleApp from '../lib/simple-app-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/simple-app-stack.ts
test('Stack create a S3 Bucket', () => {

  const app = new cdk.App();
    // WHEN
  const stack = new SimpleApp.SimpleAppStack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::S3::Bucket', {
  });
});