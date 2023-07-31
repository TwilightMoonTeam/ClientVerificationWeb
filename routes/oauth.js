const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("querystring");
const { v4 } = require("uuid");
const { Twitch, Minecraft } = require("../mongo");
require("dotenv").config();

let TwitchRedirectUri = process.env.Url + "/oauth/twitch/callback";
let OptionsRedirectUri = process.env.Url + "/oauth/options/callback";
let XboxLiveRedirectUri = process.env.Url + "/oauth/xboxlive/callback";

let isFollowed = (followedChannels, broadcasterId) => {
  for (let i = 0; i < followedChannels.length; i++) {
    if (followedChannels[i].broadcaster_id === broadcasterId) {
      return true;
    }
  }
  return false;
};

// 스트리머 본인이나 관리자 또는 트위치 시스템 오류로 인해 트위치 연동이 안되는 사람들은
// https://내도메인/oauth/options/login 으로 접속하여 트위치 연동을 시도할 수 있습니다.
router.get("/options/login", (req, res) => {
  let id = v4();
  let state = id.replace(/-/g, "");
  const params = qs.stringify({
    client_id: process.env.TwitchClientId,
    redirect_uri: OptionsRedirectUri,
    response_type: "code",
    scope: process.env.TwitchScopes,
    state: state,
  });
  res.redirect(`${process.env.TwitchRequestUri}${params}`);
});

router.get("/options/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  try {
    const tokenParams = qs.stringify({
      client_id: process.env.TwitchClientId,
      client_secret: process.env.TwitchClientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: TwitchRedirectUri,
    });

    const response = await axios.post(
      process.env.TwitchResponseUri,
      tokenParams,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;
    const TwitchApiEndpoint = `${process.env.TwitchAPIUri}/users`;
    const userResponse = await axios.get(TwitchApiEndpoint, {
      headers: {
        "Client-ID": process.env.TwitchClientId,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = userResponse.data.data[0];
    const userId = user.id;
    const userDisplay = user.display_name;
    const userEmail = user.email;

    const twitch = new Twitch({
      _id: state,
      TwitchId: userId,
      TwitchName: userDisplay,
      TwitchEmail: userEmail,
    });

    twitch
      .save()
      .then((result) => {
        console.log(result);
        res.redirect(
          `${process.env.Url}/oauth/xboxlive/login?state=${state}`
        );
      })
      .catch((err) => {
        console.log(err);
        res.render("error-handler", {
          title: "Database Error",
          error: "500",
          message: "DB에 데이터를 저장하지 못했습니다.",
          Title: process.env.Title,
          Company: process.env.Company,
          Url: process.env.Url,
          TwitchName: process.env.TwitchName,
          TwitchLink: process.env.TwitchLink,
          YoutubeLink: process.env.YoutubeLink,
          Email: process.env.Email,
        });
      });
  } catch (error) {
    res.render("error-handler", {
      title: "Twitch Error",
      error: "403",
      message: "트위치 계정을 가져오지 못했습니다.",
      Title: process.env.Title,
      Company: process.env.Company,
      Url: process.env.Url,
      TwitchName: process.env.TwitchName,
      TwitchLink: process.env.TwitchLink,
      YoutubeLink: process.env.YoutubeLink,
      Email: process.env.Email,
    });
  }
});

router.get("/twitch/login", (req, res) => {
  let id = v4();
  let state = id.replace(/-/g, "");
  const params = qs.stringify({
    client_id: process.env.TwitchClientId,
    redirect_uri: TwitchRedirectUri,
    response_type: "code",
    scope: process.env.TwitchScopes,
    state: state,
  });
  res.redirect(`${process.env.TwitchRequestUri}${params}`);
});

router.get("/twitch/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  try {
    const tokenParams = qs.stringify({
      client_id: process.env.TwitchClientId,
      client_secret: process.env.TwitchClientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: TwitchRedirectUri,
    });

    const response = await axios.post(
      process.env.TwitchResponseUri,
      tokenParams,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;
    const TwitchApiEndpoint = `${process.env.TwitchAPIUri}/users`;
    const userResponse = await axios.get(TwitchApiEndpoint, {
      headers: {
        "Client-ID": process.env.TwitchClientId,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = userResponse.data.data[0];
    const userId = user.id;
    const userDisplay = user.display_name;
    const userEmail = user.email;

    const followerEndpoint = `${process.env.TwitchAPIUri}/channels/followed?user_id=${userId}&first=100`;
    const followerResponse = await axios.get(followerEndpoint, {
      headers: {
        "Client-ID": process.env.TwitchClientId,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const followedChannels = followerResponse.data.data;
    const broadcasterId = process.env.TwitchId;

    if (isFollowed(followedChannels, broadcasterId)) {
      const twitch = new Twitch({
        _id: state,
        TwitchId: userId,
        TwitchName: userDisplay,
        TwitchEmail: userEmail,
      });
      twitch
        .save()
        .then((result) => {
          console.log(result);
          res.redirect(
            `${process.env.Url}/oauth/xboxlive/login?state=${state}`
          );
        })
        .catch((err) => {
          console.log(err);
          res.render("error-handler", {
            title: "Database Error",
            error: "500",
            message: "DB에 데이터를 저장하지 못했습니다.",
            Title: process.env.Title,
            Company: process.env.Company,
            Url: process.env.Url,
            TwitchName: process.env.TwitchName,
            TwitchLink: process.env.TwitchLink,
            YoutubeLink: process.env.YoutubeLink,
            Email: process.env.Email,
          });
        });
    } else {
      res.render("error-handler", {
        title: "Twitch Follow Error",
        error: "403",
        message: "스트리머를 팔로우하고 있지 않습니다.",
        Title: process.env.Title,
        Company: process.env.Company,
        Url: process.env.Url,
        TwitchName: process.env.TwitchName,
        TwitchLink: process.env.TwitchLink,
        YoutubeLink: process.env.YoutubeLink,
        Email: process.env.Email,
      });
    }
  } catch (error) {
    res.render("error-handler", {
      title: "Twitch Error",
      error: "403",
      message: "트위치 계정을 가져오지 못했습니다.",
      Title: process.env.Title,
      Company: process.env.Company,
      Url: process.env.Url,
      TwitchName: process.env.TwitchName,
      TwitchLink: process.env.TwitchLink,
      YoutubeLink: process.env.YoutubeLink,
      Email: process.env.Email,
    });
  }
});

router.get("/xboxlive/login", (req, res) => {
  const state = req.query.state;
  const params = qs.stringify({
    client_id: process.env.XboxLiveClientId,
    redirect_uri: XboxLiveRedirectUri,
    response_type: "code",
    scope: process.env.XboxLiveScopes,
    state: state,
  });
  res.redirect(`${process.env.XboxLiveRequestUri}${params}`);
});

router.get("/xboxlive/callback", async (req, res) => {
  code = req.query.code;
  state = req.query.state;
  try {
    const tokenParams = qs.stringify({
      client_id: process.env.XboxLiveClientId,
      scope: process.env.XboxLiveScopes,
      code: code,
      redirect_uri: XboxLiveRedirectUri,
      grant_type: "authorization_code",
      client_secret: process.env.XboxLiveClientSecret,
    });

    const response = await axios.post(
      "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
      tokenParams,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;

    const XblResponse = await axios.post(
      process.env.XboxLiveXblUri,
      {
        Properties: {
          AuthMethod: "RPS",
          SiteName: "user.auth.xboxlive.com",
          RpsTicket: `d=${accessToken}`,
        },
        RelyingParty: "http://auth.xboxlive.com",
        TokenType: "JWT",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const XblToken = XblResponse.data.Token;
    const XblUhs = XblResponse.data.DisplayClaims.xui[0].uhs;

    const XstsResponse = await axios.post(process.env.XboxLiveXstsUri, {
      Properties: {
        SandboxId: "RETAIL",
        UserTokens: [XblToken],
      },
      RelyingParty: "rp://api.minecraftservices.com/",
      TokenType: "JWT",
    });

    const XstsToken = XstsResponse.data.Token;

    const MinecraftResponse = await axios.post(process.env.MinecraftRequestUri, {
      "identityToken": `XBL3.0 x=${XblUhs};${XstsToken}`
    });

    const MinecraftToken = MinecraftResponse.data.access_token;

    const OwnershipResponse = await axios.get(process.env.MinecraftOwnerShipUri, {
      headers: {
        'Authorization' : `Bearer ${MinecraftToken}`
      }
    });

    if(OwnershipResponse.data.items.length > 0) {
      const ProfileResponse = await axios.get(process.env.MinecraftProfileUri, {
        headers: {
          'Authorization' : `Bearer ${MinecraftToken}`
        }
      });
      const minecraftId = ProfileResponse.data.id;
      const minecraftName = ProfileResponse.data.name;

      const minecraft = new Minecraft({
        _id: state,
        MinecraftId: minecraftId,
        MinecraftName: minecraftName
      });
      minecraft.save().then((result) => {
        console.log(result);
        res.redirect(`${process.env.Url}/account?state=${state}`);
      }).catch((err) => {
        console.log(err);
        res.render("error-handler", {
          title: "Database Error",
          error: "500",
          message: "DB에 데이터를 저장하지 못했습니다.",
          Title: process.env.Title,
          Company: process.env.Company,
          Url: process.env.Url,
          TwitchName: process.env.TwitchName,
          TwitchLink: process.env.TwitchLink,
          YoutubeLink: process.env.YoutubeLink,
          Email: process.env.Email,
        });
      });
    } else {
      res.render("error-handler", {
        title: "Minecraft Error",
        error: "403",
        message: "마인크래프트 정품 유무를 확인할 수 없습니다. 마인크래프트를 구매하지 않았거나, 마이크로소프트 계정과 연동하지 않았습니다. 마인크래프트를 구매하였다면, 마이크로소프트 계정과 연동해주세요.",
        Title: process.env.Title,
        Company: process.env.Company,
        Url: process.env.Url,
        TwitchName: process.env.TwitchName,
        TwitchLink: process.env.TwitchLink,
        YoutubeLink: process.env.YoutubeLink,
        Email: process.env.Email,
      });
    }
  } catch (error) {
    console.log(error);
    res.render("error-handler", {
      title: "Xbox Live Error",
      error: "403",
      message: "Xbox Live 계정을 가져오지 못했습니다. 한국 사용자의 경우 미성년자는 부모님 계정에 본인 계정을 등록하고, 연령제한을 해제해야 이용할 수 있습니다.",
      Title: process.env.Title,
      Company: process.env.Company,
      Url: process.env.Url,
      TwitchName: process.env.TwitchName,
      TwitchLink: process.env.TwitchLink,
      YoutubeLink: process.env.YoutubeLink,
      Email: process.env.Email,
    });
  }
});

module.exports = router;
