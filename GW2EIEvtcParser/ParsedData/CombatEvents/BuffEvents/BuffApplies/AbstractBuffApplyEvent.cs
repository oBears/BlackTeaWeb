﻿using GW2EIEvtcParser.EIData;

namespace GW2EIEvtcParser.ParsedData
{
    public abstract class AbstractBuffApplyEvent : AbstractBuffEvent
    {
        public uint BuffInstance { get; }

        internal AbstractBuffApplyEvent(CombatItem evtcItem, AgentData agentData, SkillData skillData) : base(evtcItem, skillData)
        {
            InternalBy = agentData.GetAgent(evtcItem.SrcAgent);
            To = agentData.GetAgent(evtcItem.DstAgent);
            BuffInstance = evtcItem.Pad;
        }

        internal AbstractBuffApplyEvent(AgentItem by, AgentItem to, long time, SkillItem buffSkill, uint id) : base(buffSkill, time)
        {
            InternalBy = by;
            To = to;
            BuffInstance = id;
        }

        internal override bool IsBuffSimulatorCompliant(long fightEnd, bool hasStackIDs)
        {
            return BuffID != Buff.NoBuff;
        }
    }
}
