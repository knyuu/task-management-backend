const { VNG_TOKENS_URL, VNG_USERNAME, VNG_PASSWORD, VNG_STORAGE_PROJECT_ERANIN, VNG_STORAGE_PROJECT} = process.env;

var obj = {
    vngTokenUrl: VNG_TOKENS_URL,
    vngUsername: VNG_USERNAME,
    vngPassword: VNG_PASSWORD,
    vngStorageProjectEranin: VNG_STORAGE_PROJECT_ERANIN,
    vngStorageProject: VNG_STORAGE_PROJECT,
};
exports.StoreConst = obj;
