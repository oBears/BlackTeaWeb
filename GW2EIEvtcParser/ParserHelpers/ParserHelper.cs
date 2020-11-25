using GW2EIEvtcParser.EIData;
using GW2EIEvtcParser.ParsedData;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace GW2EIEvtcParser
{
    public static class ParserHelper
    {

        internal static AgentItem _unknownAgent = new AgentItem();
        // use this for "null" in AbstractActor dictionaries
        internal static NPC _nullActor = new NPC(_unknownAgent);

        internal static void SafeSkip(Stream stream, long bytesToSkip)
        {
            if (stream.CanSeek)
            {
                stream.Seek(bytesToSkip, SeekOrigin.Current);
            }
            else
            {
                while (bytesToSkip > 0)
                {
                    stream.ReadByte();
                    --bytesToSkip;
                }
            }
        }


        internal const int PollingRate = 150;

        internal const int BuffDigit = 3;
        internal const int TimeDigit = 3;

        internal const long ServerDelayConstant = 10;
        internal const long BuffSimulatorDelayConstant = 50;

        internal const int PhaseTimeLimit = 1000;


        public enum Source
        {
            Common,
            Item,
            Necromancer, Reaper, Scourge,
            Elementalist, Tempest, Weaver,
            Mesmer, Chronomancer, Mirage,
            Warrior, Berserker, Spellbreaker,
            Revenant, Herald, Renegade,
            Guardian, Dragonhunter, Firebrand,
            Thief, Daredevil, Deadeye,
            Ranger, Druid, Soulbeast,
            Engineer, Scrapper, Holosmith,
            FightSpecific,
            FractalInstability,
            Unknown
        };

        internal static T MaxBy<T, TComparable>(this IEnumerable<T> en, Func<T, TComparable> evaluate) where TComparable : IComparable<TComparable>
        {
            return en.Select(t => (value: t, eval: evaluate(t)))
                .Aggregate((max, next) => next.eval.CompareTo(max.eval) > 0 ? next : max).value;
        }

        internal static T MinBy<T, TComparable>(this IEnumerable<T> en, Func<T, TComparable> evaluate) where TComparable : IComparable<TComparable>
        {
            return en.Select(t => (value: t, eval: evaluate(t)))
                .Aggregate((max, next) => next.eval.CompareTo(max.eval) < 0 ? next : max).value;
        }

        /*
        public static string UppercaseFirst(string s)
        {
            if (string.IsNullOrEmpty(s))
            {
                return string.Empty;
            }
            char[] a = s.ToCharArray();
            a[0] = char.ToUpper(a[0]);
            return new string(a);
        }


        public static string FindPattern(string source, string regex)
        {
            if (string.IsNullOrEmpty(source))
            {
                return null;
            }

            Match match = Regex.Match(source, regex);
            if (match.Success)
            {
                return match.Groups[1].Value;
            }

            return null;
        }
        */
        public static List<Source> ProfToEnum(string prof)
        {
            switch (prof)
            {
                case "Druid":
                    return new List<Source> { Source.Ranger, Source.Druid };
                case "Soulbeast":
                    return new List<Source> { Source.Ranger, Source.Soulbeast };
                case "Ranger":
                    return new List<Source> { Source.Ranger };
                case "Scrapper":
                    return new List<Source> { Source.Engineer, Source.Scrapper };
                case "Holosmith":
                    return new List<Source> { Source.Engineer, Source.Holosmith };
                case "Engineer":
                    return new List<Source> { Source.Engineer };
                case "Daredevil":
                    return new List<Source> { Source.Thief, Source.Daredevil };
                case "Deadeye":
                    return new List<Source> { Source.Thief, Source.Deadeye };
                case "Thief":
                    return new List<Source> { Source.Thief };
                case "Weaver":
                    return new List<Source> { Source.Elementalist, Source.Weaver };
                case "Tempest":
                    return new List<Source> { Source.Elementalist, Source.Tempest };
                case "Elementalist":
                    return new List<Source> { Source.Elementalist };
                case "Mirage":
                    return new List<Source> { Source.Mesmer, Source.Mirage };
                case "Chronomancer":
                    return new List<Source> { Source.Mesmer, Source.Chronomancer };
                case "Mesmer":
                    return new List<Source> { Source.Mesmer };
                case "Scourge":
                    return new List<Source> { Source.Necromancer, Source.Scourge };
                case "Reaper":
                    return new List<Source> { Source.Necromancer, Source.Reaper };
                case "Necromancer":
                    return new List<Source> { Source.Necromancer };
                case "Spellbreaker":
                    return new List<Source> { Source.Warrior, Source.Spellbreaker };
                case "Berserker":
                    return new List<Source> { Source.Warrior, Source.Berserker };
                case "Warrior":
                    return new List<Source> { Source.Warrior };
                case "Firebrand":
                    return new List<Source> { Source.Guardian, Source.Firebrand };
                case "Dragonhunter":
                    return new List<Source> { Source.Guardian, Source.Dragonhunter };
                case "Guardian":
                    return new List<Source> { Source.Guardian };
                case "Renegade":
                    return new List<Source> { Source.Revenant, Source.Renegade };
                case "Herald":
                    return new List<Source> { Source.Revenant, Source.Herald };
                case "Revenant":
                    return new List<Source> { Source.Revenant };
            }
            return new List<Source> { Source.Unknown };
        }

        internal static string GetProfIcon(string prof)
        {
            switch (prof)
            {
                case "Warrior":
                    return "https://wiki.guildwars2.com/images/4/43/Warrior_tango_icon_20px.png";
                case "Berserker":
                    return "https://wiki.guildwars2.com/images/d/da/Berserker_tango_icon_20px.png";
                case "Spellbreaker":
                    return "https://wiki.guildwars2.com/images/e/ed/Spellbreaker_tango_icon_20px.png";
                case "Guardian":
                    return "https://wiki.guildwars2.com/images/8/8c/Guardian_tango_icon_20px.png";
                case "Dragonhunter":
                    return "https://wiki.guildwars2.com/images/c/c9/Dragonhunter_tango_icon_20px.png";
                case "DragonHunter":
                    return "https://wiki.guildwars2.com/images/c/c9/Dragonhunter_tango_icon_20px.png";
                case "Firebrand":
                    return "https://wiki.guildwars2.com/images/0/02/Firebrand_tango_icon_20px.png";
                case "Revenant":
                    return "https://wiki.guildwars2.com/images/b/b5/Revenant_tango_icon_20px.png";
                case "Herald":
                    return "https://wiki.guildwars2.com/images/6/67/Herald_tango_icon_20px.png";
                case "Renegade":
                    return "https://wiki.guildwars2.com/images/7/7c/Renegade_tango_icon_20px.png";
                case "Engineer":
                    return "https://wiki.guildwars2.com/images/2/27/Engineer_tango_icon_20px.png";
                case "Scrapper":
                    return "https://wiki.guildwars2.com/images/3/3a/Scrapper_tango_icon_200px.png";
                case "Holosmith":
                    return "https://wiki.guildwars2.com/images/2/28/Holosmith_tango_icon_20px.png";
                case "Ranger":
                    return "https://wiki.guildwars2.com/images/4/43/Ranger_tango_icon_20px.png";
                case "Druid":
                    return "https://wiki.guildwars2.com/images/d/d2/Druid_tango_icon_20px.png";
                case "Soulbeast":
                    return "https://wiki.guildwars2.com/images/7/7c/Soulbeast_tango_icon_20px.png";
                case "Thief":
                    return "https://wiki.guildwars2.com/images/7/7a/Thief_tango_icon_20px.png";
                case "Daredevil":
                    return "https://wiki.guildwars2.com/images/e/e1/Daredevil_tango_icon_20px.png";
                case "Deadeye":
                    return "https://wiki.guildwars2.com/images/c/c9/Deadeye_tango_icon_20px.png";
                case "Elementalist":
                    return "https://wiki.guildwars2.com/images/a/aa/Elementalist_tango_icon_20px.png";
                case "Tempest":
                    return "https://wiki.guildwars2.com/images/4/4a/Tempest_tango_icon_20px.png";
                case "Weaver":
                    return "https://wiki.guildwars2.com/images/f/fc/Weaver_tango_icon_20px.png";
                case "Mesmer":
                    return "https://wiki.guildwars2.com/images/6/60/Mesmer_tango_icon_20px.png";
                case "Chronomancer":
                    return "https://wiki.guildwars2.com/images/f/f4/Chronomancer_tango_icon_20px.png";
                case "Mirage":
                    return "https://wiki.guildwars2.com/images/d/df/Mirage_tango_icon_20px.png";
                case "Necromancer":
                    return "https://wiki.guildwars2.com/images/4/43/Necromancer_tango_icon_20px.png";
                case "Reaper":
                    return "https://wiki.guildwars2.com/images/1/11/Reaper_tango_icon_20px.png";
                case "Scourge":
                    return "https://wiki.guildwars2.com/images/0/06/Scourge_tango_icon_20px.png";
                case "Sword":
                    return "https://wiki.guildwars2.com/images/0/07/Crimson_Antique_Blade.png";
            }
            return "";
        }
        internal static string GetNPCIcon(int id)
        {
            switch (ArcDPSEnums.GetTargetID(id))
            {
                case ArcDPSEnums.TargetID.WorldVersusWorld:
                    return "https://wiki.guildwars2.com/images/d/db/PvP_Server_Browser_%28map_icon%29.png";
                case ArcDPSEnums.TargetID.ValeGuardian:
                    return "../cache/images/https_i.imgur.com_MIpP5pK.png";
                case ArcDPSEnums.TargetID.Gorseval:
                    return "../cache/images/https_i.imgur.com_5hmMq12.png";
                case ArcDPSEnums.TargetID.Sabetha:
                    return "../cache/images/https_i.imgur.com_UqbFp9S.png";
                case ArcDPSEnums.TargetID.Slothasor:
                    return "../cache/images/https_i.imgur.com_h1xH3ER.png";
                case ArcDPSEnums.TargetID.Berg:
                    return "../cache/images/https_i.imgur.com_tLMXqL7.png";
                case ArcDPSEnums.TargetID.Narella:
                    return "../cache/images/https_i.imgur.com_FwMCoR0.png";
                case ArcDPSEnums.TargetID.Zane:
                    return "../cache/images/https_i.imgur.com_tkPWMST.png";
                case ArcDPSEnums.TargetID.Matthias:
                    return "../cache/images/https_i.imgur.com_3uMMmTS.png";
                case ArcDPSEnums.TargetID.KeepConstruct:
                    return "../cache/images/https_i.imgur.com_Kq0kL07.png";
                case ArcDPSEnums.TargetID.Xera:
                    return "../cache/images/https_i.imgur.com_lYwJEyV.png";
                case ArcDPSEnums.TargetID.Cairn:
                    return "../cache/images/https_i.imgur.com_gQY37Tf.png";
                case ArcDPSEnums.TargetID.MursaatOverseer:
                    return "../cache/images/https_i.imgur.com_5LNiw4Y.png";
                case ArcDPSEnums.TargetID.Samarog:
                    return "../cache/images/https_i.imgur.com_MPQhKfM.png";
                case ArcDPSEnums.TargetID.Deimos:
                    return "../cache/images/https_i.imgur.com_mWfxBaO.png";
                case ArcDPSEnums.TargetID.SoullessHorror:
                case ArcDPSEnums.TargetID.Desmina:
                    return "../cache/images/https_i.imgur.com_jAiRplg.png";
                case ArcDPSEnums.TargetID.BrokenKing:
                    return "../cache/images/https_i.imgur.com_FNgUmvL.png";
                case ArcDPSEnums.TargetID.SoulEater:
                    return "../cache/images/https_i.imgur.com_Sd6Az8M.png";
                case ArcDPSEnums.TargetID.EyeOfFate:
                case ArcDPSEnums.TargetID.EyeOfJudgement:
                    return "../cache/images/https_i.imgur.com_kAgdoa5.png";
                case ArcDPSEnums.TargetID.Dhuum:
                    return "../cache/images/https_i.imgur.com_RKaDon5.png";
                case ArcDPSEnums.TargetID.ConjuredAmalgamate:
                    return "../cache/images/https_i.imgur.com_C23rYTl.png";
                case ArcDPSEnums.TargetID.CALeftArm:
                    return "../cache/images/https_i.imgur.com_qrkQvEY.png";
                case ArcDPSEnums.TargetID.CARightArm:
                    return "../cache/images/https_i.imgur.com_MVwjtH7.png";
                case ArcDPSEnums.TargetID.Kenut:
                    return "../cache/images/https_i.imgur.com_6yq45Cc.png";
                case ArcDPSEnums.TargetID.Nikare:
                    return "../cache/images/https_i.imgur.com_TLykcrJ.png";
                case ArcDPSEnums.TargetID.Qadim:
                    return "../cache/images/https_i.imgur.com_IfoHTHT.png";
                case ArcDPSEnums.TargetID.Freezie:
                    return "https://wiki.guildwars2.com/images/d/d9/Mini_Freezie.png";
                case ArcDPSEnums.TargetID.Adina:
                    return "../cache/images/https_i.imgur.com_or3m1yb.png";
                case ArcDPSEnums.TargetID.Sabir:
                    return "../cache/images/https_i.imgur.com_Q4WUXqw.png";
                case ArcDPSEnums.TargetID.PeerlessQadim:
                    return "../cache/images/https_i.imgur.com_47uePpb.png";
                case ArcDPSEnums.TargetID.IcebroodConstruct:
                case ArcDPSEnums.TargetID.IcebroodConstructFraenir:
                    return "../cache/images/https_i.imgur.com_dpaZFa5.png";
                case ArcDPSEnums.TargetID.ClawOfTheFallen:
                    return "../cache/images/https_i.imgur.com_HF85QpV.png";
                case ArcDPSEnums.TargetID.VoiceOfTheFallen:
                    return "../cache/images/https_i.imgur.com_BdTGXMU.png";
                case ArcDPSEnums.TargetID.VoiceAndClaw:
                    return "../cache/images/https_i.imgur.com_V1rJBnq.png";
                case ArcDPSEnums.TargetID.FraenirOfJormag:
                    return "../cache/images/https_i.imgur.com_MxudnKp.png";
                case ArcDPSEnums.TargetID.Boneskinner:
                    return "../cache/images/https_i.imgur.com_7HPdKDQ.png";
                case ArcDPSEnums.TargetID.WhisperOfJormag:
                    return "../cache/images/https_i.imgur.com_lu9ZLVq.png";
                case ArcDPSEnums.TargetID.VariniaStormsounder:
                    return "../cache/images/https_i.imgur.com_2o8TtiM.png";
                case ArcDPSEnums.TargetID.MAMA:
                    return "../cache/images/https_i.imgur.com_1h7HOII.png";
                case ArcDPSEnums.TargetID.Siax:
                    return "../cache/images/https_i.imgur.com_5C60cQb.png";
                case ArcDPSEnums.TargetID.Ensolyss:
                    return "../cache/images/https_i.imgur.com_GUTNuyP.png";
                case ArcDPSEnums.TargetID.Skorvald:
                    return "../cache/images/https_i.imgur.com_IOPAHRE.png";
                case ArcDPSEnums.TargetID.Artsariiv:
                    return "https://wiki.guildwars2.com/images/b/b4/Artsariiv.jpg";
                case ArcDPSEnums.TargetID.Arkk:
                    return "../cache/images/https_i.imgur.com_u6vv8cW.png";
                case ArcDPSEnums.TargetID.AiKeeperOfThePeak:
                    return "../cache/images/https_i.imgur.com_eCXjoAS.png";
                case ArcDPSEnums.TargetID.AiKeeperOfThePeak2:
                    return "../cache/images/https_i.imgur.com_I8nwhAw.png";
                case ArcDPSEnums.TargetID.LGolem:
                    return "https://wiki.guildwars2.com/images/4/47/Mini_Baron_von_Scrufflebutt.png";
                case ArcDPSEnums.TargetID.AvgGolem:
                    return "https://wiki.guildwars2.com/images/c/cb/Mini_Mister_Mittens.png";
                case ArcDPSEnums.TargetID.StdGolem:
                    return "https://wiki.guildwars2.com/images/8/8f/Mini_Professor_Mew.png";
                case ArcDPSEnums.TargetID.MassiveGolem:
                    return "https://wiki.guildwars2.com/images/3/33/Mini_Snuggles.png";
                case ArcDPSEnums.TargetID.MedGolem:
                    return "https://wiki.guildwars2.com/images/c/cb/Mini_Mister_Mittens.png";
                case ArcDPSEnums.TargetID.TwistedCastle:
                    return "../cache/images/https_i.imgur.com_ZBm5Uga.png";
            }
            switch (ArcDPSEnums.GetTrashID(id))
            {
                case ArcDPSEnums.TrashID.Spirit:
                case ArcDPSEnums.TrashID.Spirit2:
                case ArcDPSEnums.TrashID.ChargedSoul:
                case ArcDPSEnums.TrashID.HollowedBomber:
                case ArcDPSEnums.TrashID.GuiltDemon:
                case ArcDPSEnums.TrashID.DoubtDemon:
                    return "../cache/images/https_i.imgur.com_sHmksvO.png";
                case ArcDPSEnums.TrashID.Saul:
                    return "../cache/images/https_i.imgur.com_ck2IsoS.png";
                case ArcDPSEnums.TrashID.GamblerClones:
                    return "../cache/images/https_i.imgur.com_zMsBWEx.png";
                case ArcDPSEnums.TrashID.GamblerReal:
                    return "../cache/images/https_i.imgur.com_J6oMITN.png";
                case ArcDPSEnums.TrashID.Pride:
                    return "../cache/images/https_i.imgur.com_ePTXx23.png";
                case ArcDPSEnums.TrashID.OilSlick:
                case ArcDPSEnums.TrashID.Oil:
                    return "../cache/images/https_i.imgur.com_R26VgEr.png";
                case ArcDPSEnums.TrashID.Tear:
                    return "../cache/images/https_i.imgur.com_N9seps0.png";
                case ArcDPSEnums.TrashID.Gambler:
                case ArcDPSEnums.TrashID.Drunkard:
                case ArcDPSEnums.TrashID.Thief:
                    return "../cache/images/https_i.imgur.com_vINeVU6.png";
                case ArcDPSEnums.TrashID.TormentedDead:
                case ArcDPSEnums.TrashID.Messenger:
                    return "../cache/images/https_i.imgur.com_1J2BTFg.png";
                case ArcDPSEnums.TrashID.Enforcer:
                    return "../cache/images/https_i.imgur.com_elHjamF.png";
                case ArcDPSEnums.TrashID.Echo:
                    return "../cache/images/https_i.imgur.com_kcN9ECn.png";
                case ArcDPSEnums.TrashID.Core:
                case ArcDPSEnums.TrashID.ExquisiteConjunction:
                    return "../cache/images/https_i.imgur.com_yI34iqw.png";
                case ArcDPSEnums.TrashID.Jessica:
                case ArcDPSEnums.TrashID.Olson:
                case ArcDPSEnums.TrashID.Engul:
                case ArcDPSEnums.TrashID.Faerla:
                case ArcDPSEnums.TrashID.Caulle:
                case ArcDPSEnums.TrashID.Henley:
                case ArcDPSEnums.TrashID.Galletta:
                case ArcDPSEnums.TrashID.Ianim:
                    return "../cache/images/https_i.imgur.com_qeYT1Bf.png";
                case ArcDPSEnums.TrashID.InsidiousProjection:
                    return "../cache/images/https_i.imgur.com_9EdItBS.png";
                case ArcDPSEnums.TrashID.EnergyOrb:
                    return "https://i.postimg.cc/NMNvyts0/Power-Ball.png";
                case ArcDPSEnums.TrashID.UnstableLeyRift:
                    return "../cache/images/https_i.imgur.com_YXM3igs.png";
                case ArcDPSEnums.TrashID.RadiantPhantasm:
                    return "../cache/images/https_i.imgur.com_O5VWLyY.png";
                case ArcDPSEnums.TrashID.CrimsonPhantasm:
                    return "../cache/images/https_i.imgur.com_zP7Bvb4.png";
                case ArcDPSEnums.TrashID.Storm:
                    return "../cache/images/https_i.imgur.com_9XtNPdw.png";
                case ArcDPSEnums.TrashID.IcePatch:
                    return "../cache/images/https_i.imgur.com_yxKJ5Yc.png";
                case ArcDPSEnums.TrashID.BanditSaboteur:
                    return "../cache/images/https_i.imgur.com_jUKMEbD.png";
                case ArcDPSEnums.TrashID.NarellaTornado:
                case ArcDPSEnums.TrashID.Tornado:
                    return "../cache/images/https_i.imgur.com_e10lZMa.png";
                case ArcDPSEnums.TrashID.Jade:
                    return "../cache/images/https_i.imgur.com_ivtzbSP.png";
                case ArcDPSEnums.TrashID.Zommoros:
                    return "../cache/images/https_i.imgur.com_BxbsRCI.png";
                case ArcDPSEnums.TrashID.AncientInvokedHydra:
                    return "../cache/images/https_i.imgur.com_YABLiBz.png";
                case ArcDPSEnums.TrashID.IcebornHydra:
                    return "../cache/images/https_i.imgur.com_LoYMBRU.png";
                case ArcDPSEnums.TrashID.IceElemental:
                    return "../cache/images/https_i.imgur.com_pEkBeNp.png";
                case ArcDPSEnums.TrashID.WyvernMatriarch:
                    return "../cache/images/https_i.imgur.com_kLKLSfv.png";
                case ArcDPSEnums.TrashID.WyvernPatriarch:
                    return "../cache/images/https_i.imgur.com_vjjNSpI.png";
                case ArcDPSEnums.TrashID.ApocalypseBringer:
                    return "../cache/images/https_i.imgur.com_0LGKCn2.png";
                case ArcDPSEnums.TrashID.ConjuredGreatsword:
                    return "../cache/images/https_i.imgur.com_vHka0QN.png";
                case ArcDPSEnums.TrashID.ConjuredShield:
                    return "../cache/images/https_i.imgur.com_wUiI19S.png";
                case ArcDPSEnums.TrashID.GreaterMagmaElemental1:
                case ArcDPSEnums.TrashID.GreaterMagmaElemental2:
                    return "../cache/images/https_i.imgur.com_sr146T6.png";
                case ArcDPSEnums.TrashID.LavaElemental1:
                case ArcDPSEnums.TrashID.LavaElemental2:
                    return "../cache/images/https_i.imgur.com_mydwiYy.png";
                case ArcDPSEnums.TrashID.PyreGuardian:
                case ArcDPSEnums.TrashID.SmallKillerTornado:
                case ArcDPSEnums.TrashID.BigKillerTornado:
                    return "../cache/images/https_i.imgur.com_6zNPTUw.png";
                case ArcDPSEnums.TrashID.QadimLamp:
                    return "../cache/images/https_i.imgur.com_89Kjv0N.png";
                case ArcDPSEnums.TrashID.PyreGuardianRetal:
                    return "../cache/images/https_i.imgur.com_WC6LRkO.png";
                case ArcDPSEnums.TrashID.PyreGuardianStab:
                    return "../cache/images/https_i.imgur.com_ISa0urR.png";
                case ArcDPSEnums.TrashID.PyreGuardianProtect:
                    return "../cache/images/https_i.imgur.com_jLW7rpV.png";
                case ArcDPSEnums.TrashID.ReaperofFlesh:
                    return "../cache/images/https_i.imgur.com_Notctbt.png";
                case ArcDPSEnums.TrashID.Kernan:
                    return "../cache/images/https_i.imgur.com_WABRQya.png";
                case ArcDPSEnums.TrashID.Knuckles:
                    return "../cache/images/https_i.imgur.com_m1y8nJE.png";
                case ArcDPSEnums.TrashID.Karde:
                    return "../cache/images/https_i.imgur.com_3UGyosm.png";
                case ArcDPSEnums.TrashID.Rigom:
                    return "../cache/images/https_i.imgur.com_REcGMBe.png";
                case ArcDPSEnums.TrashID.Guldhem:
                    return "../cache/images/https_i.imgur.com_xa7Fefn.png";
                case ArcDPSEnums.TrashID.Scythe:
                    return "../cache/images/https_i.imgur.com_INCGLIK.png";
                case ArcDPSEnums.TrashID.BanditBombardier:
                case ArcDPSEnums.TrashID.SurgingSoul:
                case ArcDPSEnums.TrashID.MazeMinotaur:
                case ArcDPSEnums.TrashID.Enervator:
                case ArcDPSEnums.TrashID.WhisperEcho:
                case ArcDPSEnums.TrashID.CharrTank:
                case ArcDPSEnums.TrashID.PropagandaBallon:
                case ArcDPSEnums.TrashID.FearDemon:
                case ArcDPSEnums.TrashID.SorrowDemon1:
                case ArcDPSEnums.TrashID.SorrowDemon2:
                case ArcDPSEnums.TrashID.SorrowDemon3:
                case ArcDPSEnums.TrashID.SorrowDemon4:
                case ArcDPSEnums.TrashID.SorrowDemon5:
                    return "../cache/images/https_i.imgur.com_k79t7ZA.png";
                case ArcDPSEnums.TrashID.HandOfErosion:
                case ArcDPSEnums.TrashID.HandOfEruption:
                    return "../cache/images/https_i.imgur.com_reGQHhr.png";
                case ArcDPSEnums.TrashID.VoltaicWisp:
                    return "../cache/images/https_i.imgur.com_C1mvNGZ.png";
                case ArcDPSEnums.TrashID.ParalyzingWisp:
                    return "../cache/images/https_i.imgur.com_YBl8Pqo.png";
                case ArcDPSEnums.TrashID.Pylon2:
                    return "../cache/images/https_i.imgur.com_b33vAEQ.png";
                case ArcDPSEnums.TrashID.EntropicDistortion:
                    return "../cache/images/https_i.imgur.com_MIpP5pK.png";
                case ArcDPSEnums.TrashID.SmallJumpyTornado:
                    return "../cache/images/https_i.imgur.com_WBJNgp7.png";
                case ArcDPSEnums.TrashID.OrbSpider:
                    return "../cache/images/https_i.imgur.com_FB5VM9X.png";
                case ArcDPSEnums.TrashID.Seekers:
                    return "../cache/images/https_i.imgur.com_FrPoluz.png";
                case ArcDPSEnums.TrashID.BlueGuardian:
                    return "../cache/images/https_i.imgur.com_6CefnkP.png";
                case ArcDPSEnums.TrashID.GreenGuardian:
                    return "../cache/images/https_i.imgur.com_nauDVYP.png";
                case ArcDPSEnums.TrashID.RedGuardian:
                    return "../cache/images/https_i.imgur.com_73Uj4lG.png";
                case ArcDPSEnums.TrashID.UnderworldReaper:
                    return "../cache/images/https_i.imgur.com_Tq6SYVe.png";
                case ArcDPSEnums.TrashID.CagedWarg:
                case ArcDPSEnums.TrashID.GreenSpirit1:
                case ArcDPSEnums.TrashID.GreenSpirit2:
                case ArcDPSEnums.TrashID.BanditSapper:
                case ArcDPSEnums.TrashID.ProjectionArkk:
                case ArcDPSEnums.TrashID.PrioryExplorer:
                case ArcDPSEnums.TrashID.PrioryScholar:
                case ArcDPSEnums.TrashID.VigilRecruit:
                case ArcDPSEnums.TrashID.VigilTactician:
                case ArcDPSEnums.TrashID.Prisoner1:
                case ArcDPSEnums.TrashID.Prisoner2:
                case ArcDPSEnums.TrashID.Pylon1:
                    return "../cache/images/https_i.imgur.com_0koP4xB.png";
                case ArcDPSEnums.TrashID.FleshWurm:
                    return "../cache/images/https_i.imgur.com_o3vX9Zc.png";
                case ArcDPSEnums.TrashID.Hands:
                    return "../cache/images/https_i.imgur.com_8JRPEoo.png";
                case ArcDPSEnums.TrashID.TemporalAnomaly:
                case ArcDPSEnums.TrashID.TemporalAnomaly2:
                    return "../cache/images/https_i.imgur.com_MIpP5pK.png";
                case ArcDPSEnums.TrashID.DOC:
                case ArcDPSEnums.TrashID.BLIGHT:
                case ArcDPSEnums.TrashID.PLINK:
                case ArcDPSEnums.TrashID.CHOP:
                    return "https://wiki.guildwars2.com/images/4/47/Mini_Baron_von_Scrufflebutt.png";
                case ArcDPSEnums.TrashID.FreeziesFrozenHeart:
                    return "https://wiki.guildwars2.com/images/9/9e/Mini_Freezie%27s_Heart.png";
                case ArcDPSEnums.TrashID.RiverOfSouls:
                    return "../cache/images/https_i.imgur.com_4pXEnaX.png";
                case ArcDPSEnums.TrashID.DhuumDesmina:
                    return "../cache/images/https_i.imgur.com_jAiRplg.png";
                //case CastleFountain:
                //    return "../cache/images/https_i.imgur.com_xV0OPWL.png";
                case ArcDPSEnums.TrashID.HauntingStatue:
                    return "../cache/images/https_i.imgur.com_7IQDyuK.png";
                case ArcDPSEnums.TrashID.GreenKnight:
                case ArcDPSEnums.TrashID.RedKnight:
                case ArcDPSEnums.TrashID.BlueKnight:
                    return "../cache/images/https_i.imgur.com_lpBm4d6.png";
            }
            return "../cache/images/https_i.imgur.com_HuJHqRZ.png";
        }


        private static readonly HashSet<string> _compressedFiles = new HashSet<string>()
        {
            ".zevtc",
            ".evtc.zip",
        };

        private static readonly HashSet<string> _tmpFiles = new HashSet<string>()
        {
            ".tmp.zip"
        };

        private static readonly HashSet<string> _supportedFiles = new HashSet<string>(_compressedFiles)
        {
            ".evtc"
        };

        public static bool IsCompressedFormat(string fileName)
        {
            foreach (string format in _compressedFiles)
            {
                if (fileName.EndsWith(format, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }

        public static List<string> GetSupportedFormats()
        {
            return new List<string>(_supportedFiles);
        }

        public static bool IsSupportedFormat(string fileName)
        {
            foreach (string format in _supportedFiles)
            {
                if (fileName.EndsWith(format, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }

        public static bool IsTemporaryFormat(string fileName)
        {
            foreach (string format in _tmpFiles)
            {
                if (fileName.EndsWith(format, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }


        internal static string GetString(Stream stream, int length, bool nullTerminated = true)
        {
            byte[] bytes = new byte[length];
            stream.Read(bytes, 0, length);
            if (nullTerminated)
            {
                for (int i = 0; i < length; ++i)
                {
                    if (bytes[i] == 0)
                    {
                        length = i;
                        break;
                    }
                }
            }
            return System.Text.Encoding.UTF8.GetString(bytes, 0, length);
        }
    }
}
