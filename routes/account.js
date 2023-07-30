const express = require("express");
const router = express.Router();
const { Twitch, Minecraft, IntegrationUser } = require("../mongo");
require("dotenv").config();

let findTwitch = async (id) => {
  try {
    const document = await Twitch.findById(id);

    if (document) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
  }
};

let findMinecraft = async (id) => {
  try {
    const document = await Minecraft.findById(id);

    if (document) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
  }
};

let findIntegrationUser = async (id) => {
  try {
    const document = await IntegrationUser.findById(id);

    if (document) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
  }
};

router.get("/", async (req, res) => {
  const state = req.query.state;
  if (state) {
    if (findTwitch(state)) {
      if (findMinecraft(state)) {
        try {
          const twitchDocument = await Twitch.findById(state);
          const minecraftDocument = await Minecraft.findById(state);
          if (findIntegrationUser(minecraftDocument.MinecraftId)) {
            res.render("account", {
                Title: process.env.Title,
                Company: process.env.Company,
                Url: process.env.Url,
                TwitchName: process.env.TwitchName,
                TwitchLink: process.env.TwitchLink,
                YoutubeLink: process.env.YoutubeLink,
                Message: "이미 연동된 계정입니다.",
                MinecraftVersion: process.env.MinecraftVersion,
                MinecraftServer: process.env.MinecraftServer,
                DiscordInvite: process.env.DiscordInvite
              });
          } else {
            let TwitchId = twitchDocument.TwitchId;
            let TwitchName = twitchDocument.TwitchName;
            let TwitchEmail = twitchDocument.TwitchEmail;
            let MinecraftId = minecraftDocument.MinecraftId;
            let MinecraftName = minecraftDocument.MinecraftName;
            const integrationUser = new IntegrationUser({
              _id: MinecraftId,
              TwitchId: TwitchId,
              TwitchName: TwitchName,
              TwitchEmail: TwitchEmail,
              MinecraftId: MinecraftId,
              MinecraftName: MinecraftName,
            });
            integrationUser.save().then((result) => {
              console.log(result);
              res.render("account", {
                Title: process.env.Title,
                Company: process.env.Company,
                Url: process.env.Url,
                TwitchName: process.env.TwitchName,
                TwitchLink: process.env.TwitchLink,
                YoutubeLink: process.env.YoutubeLink,
                Message: "계정 연동에 성공했습니다.",
                MinecraftVersion: process.env.MinecraftVersion,
                MinecraftServer: process.env.MinecraftServer,
                DiscordInvite: process.env.DiscordInvite
              });
            });
          }
        } catch (err) {
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
        }
      } else {
        res.render("error-handler", {
          title: "Database Error",
          error: "500",
          message: "DB에서 ID를 찾지 못했습니다.",
          Title: process.env.Title,
          Company: process.env.Company,
          Url: process.env.Url,
          TwitchName: process.env.TwitchName,
          TwitchLink: process.env.TwitchLink,
          YoutubeLink: process.env.YoutubeLink,
          Email: process.env.Email,
        });
      }
    } else {
      res.render("error-handler", {
        title: "Database Error",
        error: "500",
        message: "DB에서 ID를 찾지 못했습니다.",
        Title: process.env.Title,
        Company: process.env.Company,
        Url: process.env.Url,
        TwitchName: process.env.TwitchName,
        TwitchLink: process.env.TwitchLink,
        YoutubeLink: process.env.YoutubeLink,
        Email: process.env.Email,
      });
    }
  } else {
    res.redirect("/404");
  }
});

module.exports = router;
