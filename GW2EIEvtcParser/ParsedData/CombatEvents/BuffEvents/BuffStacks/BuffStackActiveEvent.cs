﻿using GW2EIEvtcParser.EIData;

namespace GW2EIEvtcParser.ParsedData
{
    public class BuffStackActiveEvent : AbstractBuffStackEvent
    {

        internal BuffStackActiveEvent(CombatItem evtcItem, AgentData agentData, SkillData skillData) : base(evtcItem, agentData, skillData)
        {
            BuffInstance = (uint)evtcItem.DstAgent;
        }

        internal override void UpdateSimulator(AbstractBuffSimulator simulator)
        {
            simulator.Activate(BuffInstance);
        }

        internal override bool IsBuffSimulatorCompliant(long fightEnd, bool hasStackIDs)
        {
            return BuffID != Buff.NoBuff && hasStackIDs && BuffInstance != 0;
        }
        internal override int CompareTo(AbstractBuffEvent abe)
        {
            if (abe is BuffStackActiveEvent)
            {
                return 0;
            }
            return 1;
        }
    }
}

