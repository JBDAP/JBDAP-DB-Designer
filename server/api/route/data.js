const folderName = 'data'
const handlers = require('../handler/' + folderName + '.js')

module.exports = [
    // 所有项目列表
    {
        method: 'GET',
        url: '/' + folderName + '/project/all',
        handler: handlers.allProjects
    },
    // 创建新项目
    {
        method: 'POST',
        url: '/' + folderName + '/project/create',
        handler: handlers.createProject
    },
    // 更新项目内容
    {
        method: 'POST',
        url: '/' + folderName + '/project/update',
        handler: handlers.updateProject
    },
    // 删除项目
    {
        method: 'GET',
        url: '/' + folderName + '/project/delete/:name',
        handler: handlers.deleteProject
    },
    // 下载项目代码
    {
        method: 'GET',
        url: '/' + folderName + '/download/:name',
        handler: handlers.download
    },    
]