﻿using GW2EIEvtcParser.ParsedData;
using System;
using System.Linq;

namespace GW2EIEvtcParser.EIData
{
    internal class BuffSimulatorIDIntensity : BuffSimulatorID
    {
        // Constructor
        public BuffSimulatorIDIntensity(ParsedEvtcLog log) : base(log)
        {
        }

        public override void Activate(uint stackID)
        {
            // nothing to do, all stack are active
            //throw new InvalidOperationException("Activate on intensity buff??");
        }

        public override void Add(long duration, AgentItem src, long start, uint stackID, bool addedActive, uint overstackDuration)
        {
            var toAdd = new BuffStackItem(start, duration, src, stackID);
            BuffStack.Add(toAdd);
            //AddedSimulationResult.Add(new BuffCreationItem(src, duration, start, toAdd.ID));
            if (overstackDuration > 0)
            {
                OverrideCandidates.Add((overstackDuration, src));
            }
        }

        protected override void Update(long timePassed)
        {
            if (BuffStack.Count > 0 && timePassed > 0)
            {
                var toAdd = new BuffSimulationItemIntensity(BuffStack);
                GenerationSimulation.Add(toAdd);
                long diff = Math.Min(BuffStack.Min(x => x.Duration), timePassed);
                long leftOver = timePassed - diff;
                if (toAdd.End > toAdd.Start + diff)
                {
                    toAdd.OverrideEnd(toAdd.Start + diff);
                }
                // Subtract from each
                for (int i = BuffStack.Count - 1; i >= 0; i--)
                {
                    BuffStack[i].Shift(diff, diff);
                }
                for (int i = BuffStack.Count - 1; i >= 0; i--)
                {
                    if (BuffStack[i].Duration == 0)
                    {
                        BuffStack[i].Shift(0, -leftOver);
                    }
                }
                Update(leftOver);
            }
        }
    }
}

