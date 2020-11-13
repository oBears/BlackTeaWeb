using GW2EIBuilders;
using GW2EIEvtcParser;
using GW2EIEvtcParser.EIData;
using GW2EIGW2API;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public static class ParseHelper
    {
        private static HTMLAssets htmlAssets;
        public static void Init(string saveDir)
        {
            htmlAssets = new HTMLAssets();
            GW2APIController.InitAPICache(saveDir);
        }

        public static void Parse(string logFile,string outputFile)
        {
            var operation = new OperationController(logFile, "Ready to parse");
            var fInfo = new FileInfo(logFile);
            var parser = new EvtcParser(new EvtcParserSettings(false, false, true, false, true, 0));
            ParsedEvtcLog log = parser.ParseLog(operation, fInfo);
            log.FightData.GetPhases(log);
            var playersAndTargets = new List<AbstractSingleActor>(log.PlayerList);
            playersAndTargets.AddRange(log.FightData.Logic.Targets);
            foreach (AbstractSingleActor actor in playersAndTargets)
            {
                actor.ComputeBuffMap(log);
            }
            if (log.CanCombatReplay)
            {
                var playersAndTargetsAndMobs = new List<AbstractSingleActor>(log.FightData.Logic.TrashMobs);
                playersAndTargetsAndMobs.AddRange(playersAndTargets);
                // init all positions
                Parallel.ForEach(playersAndTargetsAndMobs, actor => actor.GetCombatReplayPolledPositions(log));
            }
            else if (log.CombatData.HasMovementData)
            {
                Parallel.ForEach(log.PlayerList, player => player.GetCombatReplayPolledPositions(log));
            }
            Parallel.ForEach(playersAndTargets, actor => actor.GetBuffGraphs(log));
            Parallel.ForEach(log.PlayerList, player => player.GetDamageModifierStats(log, null));
            // once simulation is done, computing buff stats is thread safe
            Parallel.ForEach(log.PlayerList, player => player.GetBuffs(log, BuffEnum.Self));
            Parallel.ForEach(log.FightData.Logic.Targets, target => target.GetBuffs(log));
            DirectoryInfo saveDirectory = fInfo.Directory;
            using (var fs = new FileStream(outputFile, FileMode.Create, FileAccess.Write))
            using (var sw = new StreamWriter(fs))
            {
                var builder = new HTMLBuilder(log, new HTMLSettings(true, true), htmlAssets, null);
                builder.CreateHTML(sw, null);
            }
            operation.UpdateProgressWithCancellationCheck("HTML created");
            operation.FinalizeStatus("Parsing Successful - ");

        }
    }
}
