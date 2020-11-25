﻿using GW2EIEvtcParser.EIData;
using System.Collections.Generic;

namespace GW2EIEvtcParser.EncounterLogic
{
    internal class Escort : RaidLogic
    {
        public Escort(int triggerID) : base(triggerID)
        {
            MechanicList.AddRange(new List<Mechanic>
            {

            }
            );
            Extension = "escort";
            Icon = "https://wiki.guildwars2.com/images/b/b5/Mini_McLeod_the_Silent.png";
        }

        /*protected override CombatReplayMap GetCombatMapInternal()
        {
            return new CombatReplayMap("../cache/images/https_i.imgur.com_RZbs21b.png",
                            (1099, 1114),
                            (-5467, 8069, -2282, 11297),
                            (-12288, -27648, 12288, 27648),
                            (1920, 12160, 2944, 14464));
        }*/

        internal override string GetLogicName(ParsedEvtcLog log)
        {
            return "Escort";
        }
    }
}
