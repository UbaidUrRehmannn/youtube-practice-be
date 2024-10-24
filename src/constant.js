const constant = {
    dbName: 'youtubePracticeDb',
    dataLimit: '20kb',
    avatarImageSize: 2, // size is in MB
    coverImageSize: 5, // size is in MB
    mimeType: {
        image: 'image/',
    },
    publicRouts: ['/health-check', '/register', '/login'],
    messages: {
        error: 'Something went wrong',
        success: 'Success'
    },
};

export default constant;
