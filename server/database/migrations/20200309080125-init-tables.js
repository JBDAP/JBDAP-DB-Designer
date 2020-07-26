'use strict';

const { createTable, dropTable } = require('../tool.js')

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  // 初始化表格结构
  async function createTables() {
    try {
      // 管理员账号
      await createTable(db,'Account',{
        username: { type: 'string', notNull: true, unique: true },
        password: { type: 'string', notNull: true },
        role: { type: 'string', notNull: true },  // 超管|管理员
        authority: { type: 'text' },
        status: { type: 'string', defaultValue: '正常' }, // 正常|禁用
      })
      // Token
      await createTable(db,'Token',{
        id: { type: 'int', notNull: true },
        jid: { type: 'string', notNull: true, unique: true },
        env: { type: 'string', notNull: true },
        role: { type: 'string', notNull: true },
        source: { type: 'string', notNull: true },
        username: { type: 'string', notNull: true },
        expiresAt: { type: 'bigint', notNull: true },
      })
      // 直播室
      await createTable(db,'Room',{
        name: { type: 'string', notNull: true, unique: true },
        index: { type: 'int', notNull: true, defaultValue: 1 },
        defaultLiveId: { type: 'int' },
        status: { type: 'string', defaultValue: '可见' }, // 可见|隐藏
      })
      // 内部人员名单（可以属于多个分组）
      await createTable(db,'Person',{
        mobile: { type: 'string', notNull: true, unique: true },
        name: { type: 'string', notNull: true },
        other: { type: 'text' },
        status: { type: 'string', defaultValue: '正常' }, // 正常|禁用
      })
      // 人员标签
      await createTable(db,'PersonTag',{
        name: { type: 'string', notNull: true, unique: true },
        ids: { type: 'text' },  // 分组人员
        status: { type: 'string', defaultValue: '正常' }, // 正常|禁用
      })
      // 注册观众（每个分组中只能出现一次）
      await createTable(db,'Audience',{
        mobile: { type: 'string', notNull: true },
        name: { type: 'string', notNull: true },
        liveId: { type: 'int', notNull: true },
        other: { type: 'text' },
      })
      // 直播
      await createTable(db,'Live',{
        name: { type: 'string', notNull: true, unique: true },
        roomId: { type: 'int', notNull: true },
        type: { type: 'string', notNull: true, defaultValue: '讲师+课件' }, // 讲师+课件|单机位直播|电脑桌面共享
        channelId: { type: 'int' },
        password: { type: 'string' },
        assistantInfo: { type: 'string' },
        startsAt: { type: 'datetime' },
        endsAt: { type: 'datetime' },
        teacherName: { type: 'string' },
        introduce: { type: 'text' },
        posters: { type: 'string' },  // 海报链接数组
        authMode: { type: 'string' },  // 公开|登记|白名单
        authConfig: { type: 'text' }, // 验证模式详细配置信息
        onlineLimit: { type: 'int', defaultValue: 10000 },
        statistics: { type: 'text' },
        playBackUrl: { type: 'string' },
        attachments: { type: 'string' },
        videos: { type: 'string' },
        status: { type: 'string', defaultValue: '正常' }, // 正常|禁用
      })
      // 系统配置
      await createTable(db,'Config',{
        roles: { type: 'string', notNull: true }, // 账号角色列表
        smsp: { type: 'string'},  // 短信服务商信息
        authList: { type: 'string', notNull: true }, // 出现在授权列表中的页面选项
      })
    }
    catch (err) {
      throw err
    }
  }
  return createTables()
};

exports.down = function(db) {
  async function dropTables() {
    try {
      // 管理员账号
      await dropTable(db,'Account')
      // Token
      await dropTable(db,'Token')
      // 直播室
      await dropTable(db,'Room')
      // 内部人员名单
      await dropTable(db,'Person')
      // 人员标签
      await dropTable(db,'PersonTag')
      // 登记观众名单
      await dropTable(db,'Audience')
      // 直播活动
      await dropTable(db,'Live')
      // 系统配置
      await dropTable(db,'Config')
    }
    catch (err) {
      throw err
    }
  }
  return dropTables()
};

exports._meta = {
  "version": 1
};
