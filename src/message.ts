/**
 *
 * Wechaty: * * Wechaty - Wechat for Bot. Connecting ChatBots
 *
 * Licenst: ISC
 * https://github.com/wechaty/wechaty
 *
 */
import {
    Config
  , RecommendInfo
  , Sayable
  , log
}               from './config'

import { Contact }  from './contact'
import { Room }     from './room'
import { UtilLib }  from './util-lib'

export type MessageRawObj = {
  MsgId:            string

  MMActualSender:   string // getUserContact(message.MMActualSender,message.MMPeerUserName).isContact()
  MMPeerUserName:   string // message.MsgType == CONF.MSGTYPE_TEXT && message.MMPeerUserName == 'newsapp'
  ToUserName:       string
  MMActualContent:  string // Content has @id prefix added by wx

  MMDigest:         string
  MMDisplayTime:    number  // Javascript timestamp of milliseconds

  /**
   * MsgType == MSGTYPE_APP && message.AppMsgType == CONF.APPMSGTYPE_URL
   * class="cover" mm-src="{{getMsgImg(message.MsgId,'slave')}}"
   */
  Url:              string
  MMAppMsgDesc:     string  // class="desc" ng-bind="message.MMAppMsgDesc"

  /**
   * MsgType == MSGTYPE_APP && message.AppMsgType == CONF.APPMSGTYPE_ATTACH
   */
  MMAppMsgFileExt:  string  // doc, docx ...
  FileName:         string
  MMAppMsgFileSize: number
  MMAppMsgDownloadUrl:  string  // <a download ng-if="message.MMFileStatus == CONF.MM_SEND_FILE_STATUS_SUCCESS  
                                // && (massage.MMStatus == CONF.MSG_SEND_STATUS_SUCC || massage.MMStatus === undefined)
                                // " href="{{message.MMAppMsgDownloadUrl}}">下载</a>
  MMUploadProgress: number  // < 100

  /**
   * 模板消息
   * MSGTYPE_APP && message.AppMsgType == CONF.APPMSGTYPE_READER_TYPE
   *  item.url
   *  item.title
   *  item.pub_time
   *  item.cover
   *  item.digest
   */
  MMCategory:       any[]  //  item in message.MMCategory

  /**
   * Type
   *
   * MsgType == CONF.MSGTYPE_VOICE : ng-style="{'width':40 + 7*message.VoiceLength/1000}
   */
  MsgType:          number
  AppMsgType:       number  // message.MsgType == CONF.MSGTYPE_APP && message.AppMsgType == CONF.APPMSGTYPE_URL
                            // message.MsgType == CONF.MSGTYPE_TEXT && message.SubMsgType != CONF.MSGTYPE_LOCATION

  SubMsgType:       number // "msgType":"{{message.MsgType}}","subType":{{message.SubMsgType||0}},"msgId":"{{message.MsgId}}"

  /**
   * Status-es
   */
  Status:           string
  MMStatus:         number  // img ng-show="message.MMStatus == 1" class="ico_loading"
                            // ng-click="resendMsg(message)" ng-show="message.MMStatus == 5" title="重新发送"
  MMFileStatus:     number  // <p class="loading" ng-show="message.MMStatus == 1 || message.MMFileStatus == CONF.MM_SEND_FILE_STATUS_FAIL">
                            // CONF.MM_SEND_FILE_STATUS_QUEUED, MM_SEND_FILE_STATUS_SENDING

  /**
   * Location
   */
  MMLocationUrl:    string  // ng-if="message.MsgType == CONF.MSGTYPE_TEXT && message.SubMsgType == CONF.MSGTYPE_LOCATION"
                            // <a href="{{message.MMLocationUrl}}" target="_blank">

  /**
   * MsgType == CONF.MSGTYPE_EMOTICON
   *
   * getMsgImg(message.MsgId,'big',message)
   */

  /**
   * Image
   *
   *  getMsgImg(message.MsgId,'slave')
   */
  MMImgStyle:       string  // ng-style="message.MMImgStyle"
  MMPreviewSrc:     string  // message.MMPreviewSrc || message.MMThumbSrc || getMsgImg(message.MsgId,'slave')
  MMThumbSrc:       string

  /**
   * Friend Request & ShareCard ?
   *
   * MsgType == CONF.MSGTYPE_SHARECARD" ng-click="showProfile($event,message.RecommendInfo.UserName)
   * MsgType == CONF.MSGTYPE_VERIFYMSG
   */
  RecommendInfo?:   RecommendInfo
}

export type MessageObj = {
  id:       string
  type:     number
  from:     string
  to:       string
  room?:    string
  content:  string
  status:   string
  digest:   string
  date:     string

  url?:     string  // for MessageMedia class
}

// export type MessageTypeName = 'TEXT' | 'IMAGE' | 'VOICE' | 'VERIFYMSG' | 'POSSIBLEFRIEND_MSG' 
// | 'SHARECARD' | 'VIDEO' | 'EMOTICON' | 'LOCATION' | 'APP' | 'VOIPMSG' | 'STATUSNOTIFY' 
// | 'VOIPNOTIFY' | 'VOIPINVITE' | 'MICROVIDEO' | 'SYSNOTICE' | 'SYS' | 'RECALLED'

// export type MessageTypeValue = 1 | 3 | 34 | 37 | 40 | 42 | 43 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 62 | 9999 | 10000 | 10002

export type MessageTypeMap = {
  [index: string]: string|number
  //   MessageTypeName:  MessageTypeValue
  // , MessageTypeValue: MessageTypeName
}

export const enum MessageType {
  TEXT                = 1,
  IMAGE               = 3,
  VOICE               = 34,
  VERIFYMSG           = 37,
  POSSIBLEFRIEND_MSG  = 40,
  SHARECARD           = 42,
  VIDEO               = 43,
  EMOTICON            = 47,
  LOCATION            = 48,
  APP                 = 49,
  VOIPMSG             = 50,
  STATUSNOTIFY        = 51,
  VOIPNOTIFY          = 52,
  VOIPINVITE          = 53,
  MICROVIDEO          = 62,
  SYSNOTICE           = 9999,
  SYS                 = 10000,
  RECALLED            = 10002
}

export class Message implements Sayable {
  public static counter = 0
  private _counter: number

  public static TYPE: MessageTypeMap = {
    TEXT:               1,
    IMAGE:              3,
    VOICE:              34,
    VERIFYMSG:          37,
    POSSIBLEFRIEND_MSG: 40,
    SHARECARD:          42,
    VIDEO:              43,
    EMOTICON:           47,
    LOCATION:           48,
    APP:                49,
    VOIPMSG:            50,
    STATUSNOTIFY:       51,
    VOIPNOTIFY:         52,
    VOIPINVITE:         53,
    MICROVIDEO:         62,
    SYSNOTICE:          9999,
    SYS:                10000,
    RECALLED:           10002
  }

  public readonly id: string

  protected obj = <MessageObj>{}

  public readyStream(): Promise<NodeJS.ReadableStream> {
    throw Error('abstract method')
  }

  public ext(): string {
    throw Error('abstract method')
  }

  constructor(public rawObj?: MessageRawObj) {
    this._counter = Message.counter++
    log.silly('Message', 'constructor() SN:%d', this._counter)

    if (typeof rawObj === 'string') {
      this.rawObj = JSON.parse(rawObj)
    }

    this.rawObj = rawObj = rawObj || <MessageRawObj>{}
    this.obj = this.parse(rawObj)
    this.id = this.obj.id
  }

  // Transform rawObj to local m
  private parse(rawObj): MessageObj {
    const obj: MessageObj = {
      id:             rawObj.MsgId
      , type:         rawObj.MsgType
      , from:         rawObj.MMActualSender // MMPeerUserName
      , to:           rawObj.ToUserName
      , content:      rawObj.MMActualContent // Content has @id prefix added by wx
      , status:       rawObj.Status
      , digest:       rawObj.MMDigest
      , date:         rawObj.MMDisplayTime  // Javascript timestamp of milliseconds
    }

    // FIXME: has ther any better method to know the room ID?
    if (rawObj.MMIsChatRoom) {
      if (/^@@/.test(rawObj.FromUserName)) {
        obj.room =  rawObj.FromUserName // MMPeerUserName always eq FromUserName ?
      } else if (/^@@/.test(rawObj.ToUserName)) {
        obj.room = rawObj.ToUserName
      } else {
        log.error('Message', 'parse found a room message, but neither FromUserName nor ToUserName is a room(/^@@/)')
        // obj.room = undefined // bug compatible
      }
    // } else {
    //   obj.room = undefined
    }
    return obj
  }
  public toString() {
    return UtilLib.plainText(this.obj.content)
  }
  public toStringDigest() {
    const text = UtilLib.digestEmoji(this.obj.digest)
    return '{' + this.typeEx() + '}' + text
  }

  public toStringEx() {
    let s = `${this.constructor.name}#${this._counter}`
    s += '(' + this.getSenderString()
    s += ':' + this.getContentString() + ')'
    return s
  }
  public getSenderString() {
    const name  = Contact.load(this.obj.from)
    const room = this.obj.room
                  ? Room.load(this.obj.room)
                  : null
    return '<' + (name ? name.toStringEx() : '') + (room ? `@${room.toStringEx()}` : '') + '>'
  }
  public getContentString() {
    let content = UtilLib.plainText(this.obj.content)
    if (content.length > 20) { content = content.substring(0, 17) + '...' }
    return '{' + this.type() + '}' + content
  }

  public from(contact: Contact): void
  public from(id: string): void
  public from(): Contact
  public from(contact?: Contact|string): Contact|void {
    if (contact) {
      if (contact instanceof Contact) {
        this.obj.from = contact.id
      } else if (typeof contact === 'string') {
        this.obj.from = contact
      } else {
        throw new Error('unsupport from param: ' + typeof contact)
      }
      return
    }

    const loadedContact = Contact.load(this.obj.from)
    if (!loadedContact) {
      throw new Error('no from')
    }
    return loadedContact
  }

  public to(contact: Contact): void
  public to(room: Room): void
  public to(id: string): void
  public to(): Contact|Room
  public to(contact?: Contact|Room|string): Contact|Room|void {
    if (contact) {
      if (contact instanceof Contact || contact instanceof Room) {
        this.obj.to = contact.id
      } else if (typeof contact === 'string') {
        this.obj.to = contact
      } else {
        throw new Error('unsupport to param ' + typeof contact)
      }
      return
    }

    // FIXME: better to identify a room id?
    const loadedInstance = /^@@/.test(this.obj.to)
            ? Room.load(this.obj.to)
            : Contact.load(this.obj.to)
    if (!loadedInstance) {
      throw new Error('no to')
    }
    return loadedInstance
  }

  public room(room: Room): void
  public room(id: string): void
  public room(): Room|null
  public room(room?: Room|string): Room|null|void {
    if (room) {
      if (room instanceof Room) {
        this.obj.room = room.id
      } else if (typeof room === 'string') {
        this.obj.room = room
      } else {
        throw new Error('unsupport room param ' + typeof room)
      }
      return
    }
    if (this.obj.room) {
      return Room.load(this.obj.room)
    }
    return null
  }

  public content(content?: string): string {
    if (content) {
      this.obj.content = content
    }
    return this.obj.content
  }

  public type(): MessageType {
    return this.obj.type as MessageType
  }

  public typeEx()  { return Message.TYPE[this.obj.type] }
  public count()   { return this._counter }

  public self(): boolean {
    const userId = Config.puppetInstance()
                        .userId

    const fromId = this.obj.from
    if (!userId || !fromId) {
      throw new Error('no user or no from')
    }

    return fromId === userId
  }

  public async ready(): Promise<void> {
    log.silly('Message', 'ready()')

    try {
      const from  = Contact.load(this.obj.from)
      const to    = Contact.load(this.obj.to)
      const room  = this.obj.room ? Room.load(this.obj.room) : null

      if (!from || !to) {
        throw new Error('no `from` or no `to`')
      }
      await from.ready()                // Contact from
      await to.ready()                  // Contact to
      if (room) { await room.ready() }  // Room member list

      // return this         // return this for chain

    } catch (e) {
        log.error('Message', 'ready() exception: %s', e.stack)
        // console.log(e)
        // this.dump()
        // this.dumpRaw()
        throw e
    }
  }

  /**
   * @deprecated
   */
  public get(prop: string): string {
    log.warn('Message', 'DEPRECATED get() at %s', new Error('stack').stack)

    if (!prop || !(prop in this.obj)) {
      const s = '[' + Object.keys(this.obj).join(',') + ']'
      throw new Error(`Message.get(${prop}) must be in: ${s}`)
    }
    return this.obj[prop]
  }

  /**
   * @deprecated
   */
  public set(prop: string, value: string): this {
    log.warn('Message', 'DEPRECATED set() at %s', new Error('stack').stack)

    if (typeof value !== 'string') {
      throw new Error('value must be string, we got: ' + typeof value)
    }
    this.obj[prop] = value
    return this
  }

  public dump() {
    console.error('======= dump message =======')
    Object.keys(this.obj).forEach(k => console.error(`${k}: ${this.obj[k]}`))
  }
  public dumpRaw() {
    console.error('======= dump raw message =======')
    Object.keys(this.rawObj).forEach(k => console.error(`${k}: ${this.rawObj && this.rawObj[k]}`))
  }

  public static async find(query) {
    return Promise.resolve(new Message(<MessageRawObj>{MsgId: '-1'}))
  }

  public static async findAll(query) {
    return Promise.resolve([
      new Message   (<MessageRawObj>{MsgId: '-2'})
      , new Message (<MessageRawObj>{MsgId: '-3'})
    ])
  }

  public static initType() {
    Object.keys(Message.TYPE).forEach(k => {
      const v = Message.TYPE[k]
      Message.TYPE[v] = k // Message.Type[1] = 'TEXT'
    })
  }

  public say(content: string, replyTo?: Contact|Contact[]): Promise<any> {
    log.verbose('Message', 'say(%s, %s)', content, replyTo)

    const m = new Message()
    const room = this.room()
    if (room) {
      m.room(room)
    }

    if (!replyTo) {
      m.to(this.from())
      m.content(content)

    } else if (this.room()) {
      let mentionList
      if (Array.isArray(replyTo)) {
        m.to(replyTo[0])
        mentionList = replyTo.map(c => '@' + c.name()).join(' ')
      } else {
        m.to(replyTo)
        mentionList = '@' + replyTo.name()
      }
      m.content(mentionList + ' ' + content)

    }
    return Config.puppetInstance()
                  .send(m)
  }

}

Message.initType()

export * from './message-media'

/*
 * join room in mac client: https://support.weixin.qq.com/cgi-bin/
 * mmsupport-bin/addchatroombyinvite
 * ?ticket=AUbv%2B4GQA1Oo65ozlIqRNw%3D%3D&exportkey=AS9GWEg4L82fl3Y8e2OeDbA%3D
 * &lang=en&pass_ticket=T6dAZXE27Y6R29%2FFppQPqaBlNwZzw9DAN5RJzzzqeBA%3D
 * &wechat_real_lang=en
 */
