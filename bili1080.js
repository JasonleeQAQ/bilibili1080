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
