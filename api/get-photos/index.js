
const bucketName = process.env.PHOTO_BUCKET_NAME;

exports.handler = async function (event, context)
{
    console.log("BuccketName: " + bucketName);
    var a = "HELLO"

    return {
        statusCode: 200,
        body: a,
    };
}