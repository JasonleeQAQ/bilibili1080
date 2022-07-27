/*
应用名称：自用B站去广告脚本
脚本作者：Cuttlefish
微信账号：公众号墨鱼手记
更新时间：2022-07-03
脚本版本：(66)
通知频道：https://t.me/ddgksf2021
问题反馈：ddgksf2013@163.com
*/
const scriptName = "BiliBil1i";
const storyAidKey = "bilibili_story_aid";
const blackKey = "bilibili_feed_black";
let magicJS = MagicJS(scriptName, "INFO");

//Customize blacklist
let blacklist = [];
if (magicJS.read(blackKey)) {
  blacklist = magicJS.read(blackKey).split(";");
} else {
  const defaultList = "";
  magicJS.write(blackKey, defaultList);
  blacklist = defaultList.split(";");
}

(() => {
  let body = null;
  if (magicJS.isResponse) {
    switch (true) {
      // 推荐去广告，最后问号不能去掉，以免匹配到story模式
      case /^https:\/\/app\.bilibili\.com\/x\/v2\/feed\/index\?/.test(magicJS.request.url):
        try {
          let obj = JSON.parse(magicJS.response.body);
          let items = [];
          for (let item of obj["data"]["items"]) {
            if (item.hasOwnProperty("banner_item")) {
              let bannerItems = [];
              for (let banner of item["banner_item"]) {
                if (banner["type"] === "ad") {
                  continue;
                } else if (banner["static_banner"] && banner["static_banner"]["is_ad_loc"] != true) {
                  bannerItems.push(banner);
                }
              }
              // 去除广告后，如果banner大于等于1个才添加到响应体
              if (bannerItems.length >= 1) {
                item["banner_item"] = bannerItems;
                items.push(item);
              }
            } else if (
              !item.hasOwnProperty("ad_info") &&
              !blacklist.includes(item["args"]["up_name"]) &&
              item.card_goto.indexOf("ad") === -1 &&
              (item["card_type"] === "small_cover_v2" || item["card_type"] === "large_cover_v1"|| item["card_type"] === "large_cover_single_v9")
            ) {
              items.push(item);
            }
          }
          obj["data"]["items"] = items;
          body = JSON.stringify(obj);
        } catch (err) {
          magicJS.logError(`推荐去广告出现异常：${err}`);
        }
        break;
      // 匹配story模式，用于记录Story的aid
      case /^https:\/\/app\.bilibili\.com\/x\/v2\/feed\/index\/story\?/.test(magicJS.request.url):
        try {
          let obj = JSON.parse(magicJS.response.body);
          let items = [];
          for (let item of obj["data"]["items"]) {
            if (
              !item.hasOwnProperty("ad_info") &&
              item.card_goto.indexOf("ad") === -1) {
              items.push(item);
            }
          }
          obj["data"]["items"] = items;
          body = JSON.stringify(obj);
        } catch (err) {
          magicJS.logError(`记录Story的aid出现异常：${err}`);
        }
        break;
      
      // 标签页处理，如去除会员购等等
      case /^https?:\/\/app\.bilibili\.com\/x\/resource\/show\/tab/.test(magicJS.request.url):
        try {
          
          const tabList = new Set([39, 40, 41, 774, 857, 545, 151, 442, 99, 100, 101, 554, 556]);
          
          const topList = new Set([176, 107]);
          
          const bottomList = new Set([177, 178, 179, 181, 102,  104, 106, 486, 488, 489]);
          let obj = JSON.parse(magicJS.response.body);
          if (obj["data"]["tab"]) {
            let tab = obj["data"]["tab"].filter((e) => {
              return tabList.has(e.id);
            });
            obj["data"]["tab"] = tab;
          }
          // 将 id（222 & 107）调整为Story功能按钮
          let storyAid = magicJS.read(storyAidKey);
          if (!storyAid) {
            storyAid = "246834163";
          }
          if (obj["data"]["top"]) {
            let top = obj["data"]["top"].filter((e) => {
              if (e.id === 222 || e.id === 107) {
                e.uri = `bilibili://story/${storyAid}`;
                e.icon = "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/bilibili/bilibili_icon.png";
                e.tab_id = "Story_Top";
                e.name = "Story";
              }
              return topList.has(e.id);
            });
            obj["data"]["top"] = top;
          }
          if (obj["data"]["bottom"]) {
            let bottom = obj["data"]["bottom"].filter((e) => {
              return bottomList.has(e.id);
            });
            obj["data"]["bottom"] = bottom;
          }
          body = JSON.stringify(obj);
        } catch (err) {
          magicJS.logError(`标签页处理出现异常：${err}`);
        }
 break;
        //2022-03-05 add by ddgksf2013
        case /^https?:/\/\api\.bilibili\.com\/x\/player\/v2\?/.test(magicJS.request.url):
        try {
          let obj = JSON.parse(magicJS.response.body);
          //magicJS.logInfo(`公众号墨鱼手记`);
          obj["data"]["vip"]["type"] = 2;
          obj["data"]["vip"]["status"] = 1;
          obj["data"]["vip"]["vip_pay_type"] = 1;
          obj["data"]["vip"]["due_date"] = 4669824160;
          body = JSON.stringify(obj);
        } catch (err) {
          magicJS.logError(`1080P出现异常：${err}`);
        }
