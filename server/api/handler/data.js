
module.exports.allProjects = async (request, reply) => {
    let res = fastify.emptyReply()
    res.data = fastify.db().get('projects').value()
    return res
}

module.exports.createProject = async (request, reply) => {
    let res = fastify.emptyReply()
    res.data = fastify.db().get('projects').push(request.body).write()
    return res
}

module.exports.updateProject = async (request, reply) => {
    let res = fastify.emptyReply()
    res.data = fastify.db().get('projects').find({ name: request.body.name }).assign(request.body.newParts).write()
    return res
}

module.exports.deleteProject = async (request, reply) => {
    let res = fastify.emptyReply()
    res.data = fastify.db().get('projects').remove({ name: request.params.name }).write()
    return res
}

module.exports.download = async (request, reply) => {
    let project = fastify.db().get('projects').find({ name: request.params.name }).value()
    let final = `module.exports = ${JSON.stringify(project.tables,null,4)}`
    reply
        .code(200)
        .header('Content-Type', 'application/octet-stream; charset=utf-8')
        .header('Content-Disposition', 'attachment;filename=' + request.params.name + 'Models.js')
        .send(final)
}
