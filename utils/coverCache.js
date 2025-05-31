const fs = require("fs")
const path = require("path");

const cacheFilePath = path.join(__dirname, "../data/coverCache.json");


const loadCache = () =>{
    try{
        if(!fs.existsSync(cacheFilePath)){
            fs.writeFileSync(cacheFilePath, JSON.stringify({}), "utf8")
        }
        return JSON.parse(fs.readFileSync(cacheFilePath,"utf8"))
    } catch (error) {
    console.error("Error loading cover cache:", error);
    return {};
  }
};

const saveCache = (data) => {
    try {
        fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving cover cache:", error);
    }
};


const assignCoverImage = (userId, fileImageId) => {
    const cache = loadCache();
    cache[userId] = fileImageId;
    saveCache(cache);
};

const getCoverImage = (userId) => {
    const cache = loadCache();
    return cache[userId] || null
}

module.exports = { assignCoverImage, getCoverImage };