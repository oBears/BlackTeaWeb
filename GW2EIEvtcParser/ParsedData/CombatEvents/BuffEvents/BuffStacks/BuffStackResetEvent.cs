﻿using GW2EIEvtcParser.EIData;

namespace GW2EIEvtcParser.ParsedData
{
    public class BuffStackResetEvent : AbstractBuffStackEvent
    {
        private readonly int _resetToDuration;
        internal BuffStackResetEvent(CombatItem evtcItem, AgentData agentData, SkillData skillData) : base(evtcItem, agentData, skillData)
        {
            BuffInstance = evtcItem.Pad;
            _resetToDuration = evtcItem.Value;
        }

        internal override bool IsBuffSimulatorCompliant(long fightEnd, bool hasStackIDs)
        {
            return false; // ignore reset event
        }

        internal override void UpdateSimulator(AbstractBuffSimulator simulator)
        {
            simulator.Reset(BuffInstance, _resetToDuration);
        }
        internal override int CompareTo(AbstractBuffEvent abe)
        {
            if (abe is BuffStackActiveEvent || abe is BuffApplyEvent)
            {
                return 1;
            }
            if (abe is BuffStackResetEvent)
            {
                return 0;
            }
            return -1;
        }
    }
}

