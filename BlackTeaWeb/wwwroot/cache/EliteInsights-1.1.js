/*jshint esversion: 6 */
"use strict";

let apiRenderServiceOkay = true;

$.extend($.fn.dataTable.defaults, {
    searching: false,
    ordering: true,
    paging: false,
    retrieve: true,
    dom: "t"
});


const GraphType = {
    DPS: 0,
    Damage: 1,
    CenteredDPS: 2,
};

const simpleLogData = {
    phases: [],
    players: [],
    targets: []
};
//
// polyfill for string include
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
if (!String.prototype.includes) {
    Object.defineProperty(String.prototype, "includes", {
        value: function (search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        }
    });
}

/*var lazyTableUpdater = null;
if ('IntersectionObserver' in window) {
    lazyTableUpdater = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var id = entry.target.id;
                var table = $("#" + id);
                if ($.fn.dataTable.isDataTable(table)) {
                    table.DataTable().rows().invalidate('dom').draw();
                }
                observer.unobserve(entry.target);
            }
        });
    });
}*/
const themes = {
    "yeti": "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.1.1/yeti/bootstrap.min.css",
    "slate": "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.1.1/slate/bootstrap.min.css"
};

const urls = {
    Warrior: "https://wiki.guildwars2.com/images/4/43/Warrior_tango_icon_20px.png",
    Berserker: "https://wiki.guildwars2.com/images/d/da/Berserker_tango_icon_20px.png",
    Spellbreaker: "https://wiki.guildwars2.com/images/e/ed/Spellbreaker_tango_icon_20px.png",
    Guardian: "https://wiki.guildwars2.com/images/8/8c/Guardian_tango_icon_20px.png",
    Dragonhunter: "https://wiki.guildwars2.com/images/c/c9/Dragonhunter_tango_icon_20px.png",
    DragonHunter: "https://wiki.guildwars2.com/images/c/c9/Dragonhunter_tango_icon_20px.png",
    Firebrand: "https://wiki.guildwars2.com/images/0/02/Firebrand_tango_icon_20px.png",
    Revenant: "https://wiki.guildwars2.com/images/b/b5/Revenant_tango_icon_20px.png",
    Herald: "https://wiki.guildwars2.com/images/6/67/Herald_tango_icon_20px.png",
    Renegade: "https://wiki.guildwars2.com/images/7/7c/Renegade_tango_icon_20px.png",
    Engineer: "https://wiki.guildwars2.com/images/2/27/Engineer_tango_icon_20px.png",
    Scrapper: "https://wiki.guildwars2.com/images/3/3a/Scrapper_tango_icon_200px.png",
    Holosmith: "https://wiki.guildwars2.com/images/2/28/Holosmith_tango_icon_20px.png",
    Ranger: "https://wiki.guildwars2.com/images/4/43/Ranger_tango_icon_20px.png",
    Druid: "https://wiki.guildwars2.com/images/d/d2/Druid_tango_icon_20px.png",
    Soulbeast: "https://wiki.guildwars2.com/images/7/7c/Soulbeast_tango_icon_20px.png",
    Thief: "https://wiki.guildwars2.com/images/7/7a/Thief_tango_icon_20px.png",
    Daredevil: "https://wiki.guildwars2.com/images/e/e1/Daredevil_tango_icon_20px.png",
    Deadeye: "https://wiki.guildwars2.com/images/c/c9/Deadeye_tango_icon_20px.png",
    Elementalist: "https://wiki.guildwars2.com/images/a/aa/Elementalist_tango_icon_20px.png",
    Tempest: "https://wiki.guildwars2.com/images/4/4a/Tempest_tango_icon_20px.png",
    Weaver: "https://wiki.guildwars2.com/images/f/fc/Weaver_tango_icon_20px.png",
    Mesmer: "https://wiki.guildwars2.com/images/6/60/Mesmer_tango_icon_20px.png",
    Chronomancer: "https://wiki.guildwars2.com/images/f/f4/Chronomancer_tango_icon_20px.png",
    Mirage: "https://wiki.guildwars2.com/images/d/df/Mirage_tango_icon_20px.png",
    Necromancer: "https://wiki.guildwars2.com/images/4/43/Necromancer_tango_icon_20px.png",
    Reaper: "https://wiki.guildwars2.com/images/1/11/Reaper_tango_icon_20px.png",
    Scourge: "https://wiki.guildwars2.com/images/0/06/Scourge_tango_icon_20px.png",

    Unknown: "https://wiki.guildwars2.com/images/thumb/d/de/Sword_slot.png/40px-Sword_slot.png",
    Sword: "https://wiki.guildwars2.com/images/0/07/Crimson_Antique_Blade.png",
    Axe: "https://wiki.guildwars2.com/images/d/d4/Crimson_Antique_Reaver.png",
    Dagger: "https://wiki.guildwars2.com/images/6/65/Crimson_Antique_Razor.png",
    Mace: "https://wiki.guildwars2.com/images/6/6d/Crimson_Antique_Flanged_Mace.png",
    Pistol: "https://wiki.guildwars2.com/images/4/46/Crimson_Antique_Revolver.png",
    Scepter: "https://wiki.guildwars2.com/images/e/e2/Crimson_Antique_Wand.png",
    Focus: "https://wiki.guildwars2.com/images/8/87/Crimson_Antique_Artifact.png",
    Shield: "https://wiki.guildwars2.com/images/b/b0/Crimson_Antique_Bastion.png",
    Torch: "https://wiki.guildwars2.com/images/7/76/Crimson_Antique_Brazier.png",
    Warhorn: "https://wiki.guildwars2.com/images/1/1c/Crimson_Antique_Herald.png",
    Greatsword: "https://wiki.guildwars2.com/images/5/50/Crimson_Antique_Claymore.png",
    Hammer: "https://wiki.guildwars2.com/images/3/38/Crimson_Antique_Warhammer.png",
    Longbow: "https://wiki.guildwars2.com/images/f/f0/Crimson_Antique_Greatbow.png",
    Shortbow: "https://wiki.guildwars2.com/images/1/17/Crimson_Antique_Short_Bow.png",
    Rifle: "https://wiki.guildwars2.com/images/1/19/Crimson_Antique_Musket.png",
    Staff: "https://wiki.guildwars2.com/images/5/5f/Crimson_Antique_Spire.png",
    Trident: "https://wiki.guildwars2.com/images/9/98/Crimson_Antique_Trident.png",
    Speargun: "https://wiki.guildwars2.com/images/3/3b/Crimson_Antique_Harpoon_Gun.png",
    Spear: "https://wiki.guildwars2.com/images/c/cb/Crimson_Antique_Impaler.png"
};

const specs = [
    "Warrior", "Berserker", "Spellbreaker", "Revenant", "Herald", "Renegade", "Guardian", "Dragonhunter", "Firebrand",
    "Ranger", "Druid", "Soulbeast", "Engineer", "Scrapper", "Holosmith", "Thief", "Daredevil", "Deadeye",
    "Mesmer", "Chronomancer", "Mirage", "Necromancer", "Reaper", "Scourge", "Elementalist", "Tempest", "Weaver"
];

const specToBase = {
    Warrior: 'Warrior',
    Berserker: 'Warrior',
    Spellbreaker: 'Warrior',
    Revenant: "Revenant",
    Herald: "Revenant",
    Renegade: "Revenant",
    Guardian: "Guardian",
    Dragonhunter: "Guardian",
    Firebrand: "Guardian",
    Ranger: "Ranger",
    Druid: "Ranger",
    Soulbeast: "Ranger",
    Engineer: "Engineer",
    Scrapper: "Engineer",
    Holosmith: "Engineer",
    Thief: "Thief",
    Daredevil: "Thief",
    Deadeye: "Thief",
    Mesmer: "Mesmer",
    Chronomancer: "Mesmer",
    Mirage: "Mesmer",
    Necromancer: "Necromancer",
    Reaper: "Necromancer",
    Scourge: "Necromancer",
    Elementalist: "Elementalist",
    Tempest: "Elementalist",
    Weaver: "Elementalist"
};
"use strict";

var roundingComponent = {
    methods: {
        round: function (value) {
            if (isNaN(value)) {
                return 0;
            }
            return Math.round(value);
        },
        round2: function (value) {
            if (isNaN(value)) {
                return 0;
            }
            var mul = 100;
            return Math.round(mul * value) / mul;
        },
        round3: function (value) {
            if (isNaN(value)) {
                return 0;
            }
            var mul = 1000;
            return Math.round(mul * value) / mul;
        }
    }
};

var graphComponent = {
    data: function () {
        return {
            graphdata: {
                dpsmode: 0,
                graphmode: GraphType.DPS,
            },
            layout: {},
            dpsCache: new Map(),
            dataCache: new Map(),
        };
    }
};

var timeRefreshComponent = {
    props: ["time"],
    data: function () {
        return {
            refreshTime: 0
        };
    },
    computed: {
        timeToUse: function () {
            if (animator) {
                var animated = animator.animation !== null;
                if (animated) {
                    var speed = animator.speed;
                    if (Math.abs(this.time - this.refreshTime) > speed * 64) {
                        this.refreshTime = this.time;
                        return this.time;
                    }
                    return this.refreshTime;
                } else {
                    this.refreshTime = this.time;
                    return this.time;
                }
            }
            return this.time;
        },
    },
};
/*jshint esversion: 6 */
"use strict";
function computeGradient(left, percent) {
    var template = "linear-gradient(to right, $fill$, $middle$, $black$)";
    var res = percent;
    var fillPercent = left + " " + res + "%";
    var blackPercent = "black " + (100 - res) + "%";
    var middle = res + "%";
    template = template.replace("$fill$", fillPercent);
    template = template.replace("$black$", blackPercent);
    template = template.replace("$middle$", middle);
    return template;
};

function computeSliderGradient(color, fillColor, startPercent, endPercent) {
    var template = "linear-gradient(to right, $left$, $left2$, $middle$, $middle2$, $right$, $right2$)";
    var left = color + " " + 0 + "%";
    var left2 = color + " " + startPercent + "%";
    var right = color + " " + endPercent + "%";
    var right2 = color + " " + 100 + "%";
    var middle = fillColor + " " + startPercent + "%";
    var middle2 = fillColor + " " + endPercent + "%";
    template = template.replace("$left$", left);
    template = template.replace("$left2$", left2);
    template = template.replace("$right$", right);
    template = template.replace("$right2$", right2);
    template = template.replace("$middle$", middle);
    template = template.replace("$middle2$", middle2);
    return template;
};

function buildFallBackURL(skill) {
    if (!skill.icon || skill.fallBack) {
        return;
    }
    var apiIcon = skill.icon;
    if (!apiIcon.includes("render")) {
        return;
    }
    var splitIcon = apiIcon.split('/');
    var signature = splitIcon[splitIcon.length - 2];
    var id = splitIcon[splitIcon.length - 1].split('.')[0] + "-64px.png";
    skill.icon = "https://darthmaim-cdn.de/gw2treasures/icons/" + signature + "/" + id;
    skill.fallBack = true;
}

function findSkill(isBuff, id) {
    var skill;
    if (isBuff) {
        skill = logData.buffMap['b' + id] || {};
        skill.condi = true;
    } else {
        skill = logData.skillMap["s" + id] || {};
    }
    if (!apiRenderServiceOkay) {
        buildFallBackURL(skill);
    }
    return skill;
}

function getTargetCacheID(activetargets) {
    var id = 0;
    for (var i = 0; i < activetargets.length; i++) {
        id = id | Math.pow(2, activetargets[i]);
    }
    return id;
}

const quickColor = {
    r: 220,
    g: 20,
    b: 220
};
const slowColor = {
    r: 220,
    g: 125,
    b: 30
};
const normalColor = {
    r: 125,
    g: 125,
    b: 125
};

function computeRotationData(rotationData, images, data, phase) {
    if (rotationData) {
        var rotaTrace = {
            x: [],
            base: [],
            y: [],
            name: 'Rotation',
            text: [],
            orientation: 'h',
            mode: 'markers',
            type: 'bar',
            width: [],
            hoverinfo: 'text',
            hoverlabel: {
                namelength: '-1'
            },
            marker: {
                color: [],
                width: '5',
                line: {
                    color: [],
                    width: '2.0'
                }
            },
            showlegend: false
        }
        for (var i = 0; i < rotationData.length; i++) {
            var item = rotationData[i];
            var x = item[0];
            var skillId = item[1];
            var duration = item[2];
            var endType = item[3];
            var quick = item[4];
            var skill = findSkill(false, skillId);
            var aa = false;
            var icon;
            var name = '???';
            if (skill) {
                aa = skill.aa;
                icon = skill.icon;
                name = skill.name;
            }

            if (!icon.includes("render") && !icon.includes("darthmaim")) {
                icon = null;
            }

            var fillColor;
            var originalDuration = duration;
            if (endType == 1) { 
                fillColor = 'rgb(0,0,255)'; 
            }
            else if (endType == 2) { 
                fillColor = 'rgb(255,0,0)'; 
            }
            else if (endType == 3) { 
                fillColor = 'rgb(0,255,0)'; 
            }
            else if (endType == 4) { 
                fillColor = 'rgb(0,255,255)'; 
                duration = 50;
            }
            else { 
                fillColor = 'rgb(255,255,0)'; 
            }

            var clampedX = Math.max(x, 0);
            var diffX = clampedX - x;
            var clampedWidth = Math.min(x + duration / 1000.0, phase.duration / 1000.0) - x - diffX;
            if (!aa && icon) {
                images.push({
                    source: icon,
                    xref: 'x',
                    yref: 'y',
                    x: clampedX,
                    y: 0.0,
                    sizex: 1.1,
                    sizey: 1.1,
                    xanchor: 'middle',
                    yanchor: 'bottom'
                });
            }

            rotaTrace.x.push(clampedWidth - 0.001);
            rotaTrace.base.push(clampedX);
            rotaTrace.y.push(1.2);
            rotaTrace.text.push(name + ' at ' + x + 's for ' + originalDuration + 'ms');
            rotaTrace.width.push(aa ? 0.5 : 1.0);
            rotaTrace.marker.color.push(fillColor);

            var outlineR = quick > 0.0 ? quick * quickColor.r + (1.0 - quick) * normalColor.r : -quick * slowColor.r + (1.0 + quick) * normalColor.r;
            var outlineG = quick > 0.0 ? quick * quickColor.g + (1.0 - quick) * normalColor.g : -quick * slowColor.r + (1.0 + quick) * normalColor.r;
            var outlineB = quick > 0.0 ? quick * quickColor.b + (1.0 - quick) * normalColor.b : -quick * slowColor.r + (1.0 + quick) * normalColor.r;
            rotaTrace.marker.line.color.push('rgb(' + outlineR + ',' + outlineG + ',' + outlineB + ')');
        }
        data.push(rotaTrace);
        return 1;
    }
    return 0;
}

function computePhaseMarkupSettings(currentArea, areas, annotations) {
    var y = 1;
    var textbg = '#0000FF';
    var x = (currentArea.end + currentArea.start) / 2;
    for (var i = annotations.length - 1; i >= 0; i--) {
        var annotation = annotations[i];
        var area = areas[i];
        if ((area.start <= currentArea.start && area.end >= currentArea.end) || area.end >= currentArea.start - 2) {
            // current area included in area OR current area intersects area
            if (annotation.bgcolor === textbg) {
                textbg = '#FF0000';
            }
            y = annotation.y === y && area.end > currentArea.start ? 1.09 : y;
            break;
        }
    }
    return {
        y: y,
        x: x,
        textbg: textbg
    };
}

function computePhaseMarkups(shapes, annotations, phase, linecolor) {
    if (phase.markupAreas) {
        for (var i = 0; i < phase.markupAreas.length; i++) {
            var area = phase.markupAreas[i];
            var setting = computePhaseMarkupSettings(area, phase.markupAreas, annotations);
            if (area.label) {
                annotations.push({
                    x: setting.x,
                    y: setting.y,
                    xref: 'x',
                    yref: 'paper',
                    xanchor: 'center',
                    yanchor: 'bottom',
                    text: area.label + '<br>' + '(' + Math.round(1000 * (area.end - area.start)) / 1000 + ' s)',
                    font: {
                        color: '#ffffff'
                    },
                    showarrow: false,
                    bordercolor: '#A0A0A0',
                    borderwidth: 2,
                    bgcolor: setting.textbg,
                    opacity: 0.8
                });
            }

            if (area.highlight) {
                shapes.push({
                    type: 'rect',
                    xref: 'x',
                    yref: 'paper',
                    x0: area.start,
                    y0: 0,
                    x1: area.end,
                    y1: 1,
                    fillcolor: setting.textbg,
                    opacity: 0.2,
                    line: {
                        width: 0
                    },
                    layer: 'below'
                });
            }
        }
    }
    if (phase.markupLines) {
        for (var i = 0; i < phase.markupLines.length; i++) {
            var x = phase.markupLines[i];
            shapes.push({
                type: 'line',
                xref: 'x',
                yref: 'paper',
                x0: x,
                y0: 0,
                x1: x,
                y1: 1,
                line: {
                    color: linecolor,
                    width: 2,
                    dash: 'dash'
                },
                opacity: 0.6,
            });
        }
    }
}


function computePlayerDPS(player, damageData, lim, phasebreaks, activetargets, cacheID, times, graphMode) {
    if (player.dpsGraphCache.has(cacheID)) {
        return player.dpsGraphCache.get(cacheID);
    }
    var totalDamage = 0;
    var targetDamage = 0;
    var totalDPS = [0];
    var cleaveDPS = [0];
    var targetDPS = [0];
    var totalTotalDamage = [0];
    var totalCleaveDamage = [0];
    var totalTargetDamage = [0];
    var maxDPS = {
        total: 0,
        cleave: 0,
        target: 0
    };
    if (graphMode === GraphType.CenteredDPS) {
        lim /= 2;
    }
    var end = times.length;
    var left = 0, right = 0, targetid, k;
    for (var j = 0; j < end; j++) {
        var time = times[j];
        if (lim > 0) {
            left = Math.max(Math.round(time - lim), 0);
        } else if (phasebreaks && phasebreaks[j]) {
            left = j;
        }
        right = j;    
        if (graphMode === GraphType.CenteredDPS) {
            if (lim > 0) {
                right = Math.min(Math.round(time + lim), end - 1);
            } else if (phasebreaks) {
                for (var i = left + 1; i < phasebreaks.length; i++) {
                    if (phasebreaks[i]) {
                        right = i;
                        break;
                    }
                }
            } else {
                right = end - 1;
            }
        }          
        var div = graphMode !== GraphType.Damage ? Math.max(times[right] - times[left], 1) : 1;
        totalDamage = damageData.total[right] - damageData.total[left];
        targetDamage = 0;
        for (k = 0; k < activetargets.length; k++) {
            targetid = activetargets[k];
            targetDamage += damageData.targets[targetid][right] - damageData.targets[targetid][left];
        }
        totalDPS[j] = Math.round(totalDamage / div);
        targetDPS[j] = Math.round(targetDamage / div);
        cleaveDPS[j] = Math.round((totalDamage - targetDamage) / div);
        totalTotalDamage[j] = totalDamage;
        totalTargetDamage[j] = targetDamage;
        totalCleaveDamage[j] = (totalDamage - targetDamage);
        maxDPS.total = Math.max(maxDPS.total, totalDPS[j]);
        maxDPS.target = Math.max(maxDPS.target, targetDPS[j]);
        maxDPS.cleave = Math.max(maxDPS.cleave, cleaveDPS[j]);
    }
    if (maxDPS.total < 1e-6) {
        maxDPS.total = 10;
    }
    if (maxDPS.target < 1e-6) {
        maxDPS.target = 10;
    }
    if (maxDPS.cleave < 1e-6) {
        maxDPS.cleave = 10;
    }
    var res = {
        dps: {
            total: totalDPS,
            target: targetDPS,
            cleave: cleaveDPS
        },
        total: {
            total: totalTotalDamage,
            target: totalTargetDamage,
            cleave: totalCleaveDamage
        },
        maxDPS: maxDPS
    };
    player.dpsGraphCache.set(cacheID, res);
    return res;
}

function findState(states, timeS, start, end) {
    // when the array exists, it covers from 0 to fightEnd by construction
    var id = Math.floor((end + start) / 2);
    if (id === start || id === end) {
        return states[id][1];
    }
    var item = states[id];
    var itemN = states[id + 1];
    var x = item[0];
    var xN = itemN[0];
    if (timeS < x) {
        return findState(states, timeS, start, id);
    } else if (timeS > xN) {
        return findState(states, timeS, id, end);
    } else {
        return item[1];
    }
}

function getActorGraphLayout(images, color) {
    return {
        barmode: 'stack',
        yaxis: {
            title: 'Rotation',
            domain: [0, 0.09],
            fixedrange: true,
            showgrid: false,
            showticklabels: false,
            color: color,
            range: [0, 2]
        },
        legend: {
            traceorder: 'reversed'
        },
        hovermode: 'x',
        hoverdistance: 150,
        yaxis2: {
            title: 'Buffs',
            domain: [0.11, 0.6],
            color: color,
            gridcolor: color,
            fixedrange: true
        },
        yaxis3: {
            title: 'DPS',
            color: color,
            gridcolor: color,
            domain: [0.61, 1]
        },
        images: images,
        font: {
            color: color
        },
        xaxis: {
            title: 'Time(sec)',
            color: color,
            gridcolor: color,
            xrangeslider: {}
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        shapes: [],
        annotations: [],
        autosize: true,
        width: 1100,
        height: 800,
        datarevision: new Date().getTime(),
    };
}

function computeTargetHealthData(graph, targets, phase, data, yaxis) {
    for (var i = 0; i < graph.targets.length; i++) {
        var health = graph.targets[i].healthStates;
        var hpTexts = [];
        var times = [];
        var target = targets[phase.targets[i]];
        for (var j = 0; j < health.length; j++) {
            hpTexts[j] = health[j][1] + "% hp - " + target.name;
            times[j] = health[j][0];
        }
        var res = {
            x: times,
            text: hpTexts,
            mode: 'lines',
            line: {
                dash: 'dashdot',
                shape: 'hv'
            },
            hoverinfo: 'text',
            name: target.name + ' health',
        };
        if (yaxis) {
            res.yaxis = yaxis;
        }
        data.push(res);
    }
    return graph.targets.length;
}

function computeTargetBreakbarData(graph, targets, phase, data, yaxis) {
    var count = 0;
    for (var i = 0; i < graph.targets.length; i++) {
        var breakbar = graph.targets[i].breakbarPercentStates;
        if (!breakbar) {
            continue;
        }
        count++;
        var breakbarTexts = [];
        var times = [];
        var target = targets[phase.targets[i]];
        for (var j = 0; j < breakbar.length; j++) {
            breakbarTexts[j] = breakbar[j][1] + "% breakbar - " + target.name;
            times[j] = breakbar[j][0];
        }
        var res = {
            x: times,
            text: breakbarTexts,
            mode: 'lines',
            line: {
                dash: 'dashdot',
                shape: 'hv'
            },
            hoverinfo: 'text',
            visible: phase.breakbarPhase ? true : "legendonly",
            name: target.name + ' breakbar',
        };
        if (yaxis) {
            res.yaxis = yaxis;
        }
        data.push(res);
    }
    return count;
}

function computePlayerHealthData(healthGraph, data, yaxis) {
    var health = healthGraph;
    var hpTexts = [];
    var times = [];
    for (var j = 0; j < health.length; j++) {
        hpTexts[j] = health[j][1] + "% hp - Player";
        times[j] = health[j][0];
    }
    var res = {
        x: times,
        text: hpTexts,
        mode: 'lines',
        line: {
            dash: 'dashdot',
            shape: 'hv'
        },
        hoverinfo: 'text',
        name: 'Player health',
        visible: 'legendonly',
    };
    if (yaxis) {
        res.yaxis = yaxis;
    }
    data.push(res);
    return 1;
}

function computeBuffData(buffData, data) {
    if (buffData) {
        for (var i = 0; i < buffData.length; i++) {
            var boonItem = buffData[i];
            var boon = findSkill(true, boonItem.id);
            var line = {
                x: [],
                y: [],
                text: [],
                yaxis: 'y2',
                type: 'scatter',
                visible: boonItem.visible ? null : 'legendonly',
                line: {
                    color: boonItem.color,
                    shape: 'hv'
                },
                hoverinfo: 'text+x',
                fill: 'tozeroy',
                name: boon.name.substring(0, 20)
            };
            for (var p = 0; p < boonItem.states.length; p++) {
                line.x.push(boonItem.states[p][0]);
                line.y.push(boonItem.states[p][1]);
                line.text.push(boon.name + ': ' + boonItem.states[p][1]);
            }
            data.push(line);
        }
        return buffData.length;
    }
    return 0;
}

function initTable (id, cell, order, orderCallBack) {
    var table = $(id);
    if (!table.length) {
        return;
    }
    /*if (lazyTableUpdater) {
        var lazyTable = document.querySelector(id);
        var lazyTableObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    table.DataTable({
                        order: [
                            [cell, order]
                        ]
                    });
                    if (orderCallBack) {
                        table.DataTable().on('order.dt', orderCallBack);
                    }
                    observer.unobserve(entry.target);
                }
            });
        });
        lazyTableObserver.observe(lazyTable);
    } else {*/
    var data = {
        order: [
            [cell, order]
        ]
    };
    table.DataTable(data);
    if (orderCallBack) {
        table.DataTable().on('order.dt', orderCallBack);
    }
    //}
};

function updateTable(id) {
    /*if (lazyTableUpdater) {
        var lazyTable = document.querySelector(id);
        lazyTableUpdater.unobserve(lazyTable);
        lazyTableUpdater.observe(lazyTable);
    } else {*/
    var table = $(id);
    if ($.fn.dataTable.isDataTable(id)) {
        table.DataTable().rows().invalidate('dom');
        table.DataTable().draw();
    }
    //}
};

/*function getActorGraphLayout(images, boonYs, stackingBoons) {
    var layout = {
        barmode: 'stack',
        yaxis: {
            title: 'Rotation',
            domain: [0, 0.1],
            fixedrange: true,
            showgrid: false,
            showticklabels: false,
            color: '#cccccc',
            range: [0, 2]
        },
        legend: {
            traceorder: 'reversed'
        },
        hovermode: 'compare',
        images: images,
        font: {
            color: '#cccccc'
        },
        xaxis: {
            title: 'Time(sec)',
            color: '#cccccc',
            gridcolor: '#cccccc',
            xrangeslider: {}
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        shapes: [],
        annotations: [],
        autosize: true,
        width: 1100,
        height: 1100,
        datarevision: new Date().getTime(),
    };
    layout['yaxis' + (2 + boonYs)] = {
        title: 'DPS',
        color: '#cccccc',
        gridcolor: '#cccccc',
        domain: [0.75, 1]
    };
    var perBoon = 0.65 / boonYs;
    var singleBuffs = boonYs;
    if (stackingBoons) {
        layout['yaxis' + (2 + boonYs - 1)] = {
            title: 'Stacking Buffs',
            color: '#cccccc',
            gridcolor: '#cccccc',
            domain: [0.70, 0.75]
        };
        perBoon = 0.6 / (boonYs - 1);
        singleBuffs--;
    }
    for (var i = 0; i < singleBuffs; i++) {
        layout['yaxis' + (2 + i)] = {
            title: '',
            color: '#cccccc',
            showgrid: false,
            showticklabels: false,
            domain: [0.1 + i * perBoon, 0.1 + (i + 1) * perBoon]
        };
    }
    return layout;
}*/

/*
function computeBuffData(buffData, data) {
    var ystart = 0;
    if (buffData) {
        var stackings = [];
        var i;
        for (i = buffData.length - 1; i >= 0; i--) {
            var boonItem = buffData[i];
            var boon = findSkill(true, boonItem.id);
            var line = {
                x: [],
                y: [],
                yaxis: boon.stacking ? 'stacking' : 'y' + (2 + ystart++),
                type: 'scatter',
                visible: boonItem.visible || !boon.stacking ? null : 'legendonly',
                line: {
                    color: boonItem.color,
                    shape: 'hv'
                },
                fill: boon.stacking ? 'tozeroy' : 'toself',
                name: boon.name,
                showlegend: boon.stacking ? true : false,
            };
            for (var p = 0; p < boonItem.states.length; p++) {
                line.x[p] = boonItem.states[p][0];
                line.y[p] = boonItem.states[p][1];
            }
            if (boon.stacking) {
                stackings.push(line);
            }
            data.push(line);
        }
        if (stackings.length) {
            var axis = 'y' + (2 + ystart++);
            for (i = 0; i < stackings.length; i++) {
                stackings[i].yaxis = axis;
            }
        }
        return {
            actorOffset: buffData.length,
            y: ystart,
            stacking: stackings.length > 0
        };
    }
    return {
        actorOffset: 0,
        y: 0,
        stacking: false
    };
}*/
/*jshint esversion: 6 */
"use strict";
function compileTemplates() {
    Vue.component("graph-component", {
        props: ['id', 'layout', 'data'],
        template: '<div :id="id" class="d-flex flex-row justify-content-center"></div>',
        mounted: function () {
            var div = document.querySelector(this.queryID);
            Plotly.react(div, this.data, this.layout, { showEditInChartStudio: true, plotlyServerURL: "https://chart-studio.plotly.com" });
            var _this = this;
            div.on('plotly_animated', function () {
                Plotly.relayout(div, _this.layout);
            });
        },
        computed: {
            queryID: function () {
                return "#" + this.id;
            }
        },
        watch: {
            layout: {
                handler: function () {
                    var div = document.querySelector(this.queryID);
                    var duration = 1000;
                    Plotly.animate(div, {
                        data: this.data
                    }, {
                        transition: {
                            duration: duration,
                            easing: 'cubic-in-out'
                        },
                        frame: {
                            duration: 0.75 * duration
                        }
                    });
                },
                deep: true
            }
        }
    });
    {
    Vue.component("buff-stats-component", {
        props: ['type', 'phaseindex', 'playerindex', 'activeduration'],
        template: `    <div>        <div class="d-flex flex-row justify-content-center mt-1 mb-1">            <ul class="nav nav-pills d-flex flex-row justify-content-center scale85">                <li class="nav-item">                    <a class="nav-link" @click="mode = 0" :class="{active: mode === 0}">Uptime</a>                </li>                <li class="nav-item">                    <a class="nav-link" @click="mode = 1" :class="{active: mode === 1 }">Generation Self</a>                </li>                <li class="nav-item">                    <a class="nav-link" @click="mode = 2" :class="{active: mode === 2 }"                        data-original-title="Self excluded">Generation Group</a>                </li>                <li v-if="!singleGroup" class="nav-item">                    <a class="nav-link" @click="mode = 3" :class="{active: mode === 3 }"                        data-original-title="Self excluded">Generation Off-Group</a>                </li>                <li v-if="!singleGroup" class="nav-item">                    <a class="nav-link" @click="mode = 4" :class="{active: mode === 4 }"                        data-original-title="Self excluded">Generation Squad</a>                </li>            </ul>        </div>        <keep-alive>            <buff-table-component v-if="type === 0" :key="'boon-stats-table'" :condition="false"                :generation="mode > 0" :id="'boon-stats-table'" :buffs="boons" :playerdata="buffData.boonsData[mode]"                :sums="mode === 0 ? buffData.boonsData[5] : []" :playerindex="playerindex">            </buff-table-component>            <buff-table-component v-if="type === 1" :key="'offensivebuff-stats-table'"                :condition="false" :generation="mode > 0" :id="'offensivebuff-stats-table'" :buffs="offs"                :playerdata="buffData.offsData[mode]" :sums="mode === 0 ? buffData.offsData[5] : []"                :playerindex="playerindex">            </buff-table-component>            <buff-table-component v-if="type === 2" :key="'supportbuff-stats-table'"                :condition="false" :generation="mode > 0" :id="'supportbuff-stats-table'" :buffs="sups"                :playerdata="buffData.supsData[mode]" :sums="mode === 0 ? buffData.supsData[5] : []"                :playerindex="playerindex">            </buff-table-component>            <buff-table-component v-if="type === 3" :key="'defensivebuff-stats-table'"                :condition="false" :generation="mode > 0" :id="'defensivebuff-stats-table'" :buffs="defs"                :playerdata="buffData.defsData[mode]" :sums="mode === 0 ? buffData.defsData[5] : []"                :playerindex="playerindex">            </buff-table-component>        </keep-alive>    </div>`,
        data: function () {
            return {
                mode: 0,
                cache: new Map()
            };
        },
        computed: {
            singleGroup: function () {
                return logData.singleGroup;
            },
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            boons: function () {
                var data = [];
                for (var i = 0; i < logData.boons.length; i++) {
                    data[i] = findSkill(true, logData.boons[i]);
                }
                return data;
            },
            offs: function () {
                var data = [];
                for (var i = 0; i < logData.offBuffs.length; i++) {
                    data[i] = findSkill(true, logData.offBuffs[i]);
                }
                return data;
            },
            defs: function () {
                var data = [];
                for (var i = 0; i < logData.defBuffs.length; i++) {
                    data[i] = findSkill(true, logData.defBuffs[i]);
                }
                return data;
            },
            sups: function () {
                var data = [];
                for (var i = 0; i < logData.supBuffs.length; i++) {
                    data[i] = findSkill(true, logData.supBuffs[i]);
                }
                return data;
            },
            buffData: function () {
                var id = this.phaseindex + '-' + this.activeduration;
                if (this.cache.has(id)) {
                    return this.cache.get(id);
                }
                var activeduration = this.activeduration;
                var activeTimes = this.phase.playerActiveTimes;
                var getData = function (stats, genself, gengroup, genoffgr, gensquad) {
                    var uptimes = [],
                        gens = [],
                        gengr = [],
                        genoff = [],
                        gensq = [];
                    var avg = [],
                        gravg = [],
                        totalavg = [];
                    var grcount = [],
                        totalcount = 0;
                    var grBoonAvg = [],
                        totalBoonAvg = 0;
                    var i, k;
                    for (i = 0; i < logData.players.length; i++) {
                        var player = logData.players[i];
                        if (player.isConjure) {
                            continue;
                        }
                        uptimes.push({
                            player: player,
                            data: stats[i]
                        });
                        gens.push({
                            player: player,
                            data: genself[i]
                        });
                        gengr.push({
                            player: player,
                            data: gengroup[i]
                        });
                        genoff.push({
                            player: player,
                            data: genoffgr[i]
                        });
                        gensq.push({
                            player: player,
                            data: gensquad[i]
                        });
                        if (activeduration && activeTimes[i] < 1e-6) {
                            continue;
                        }
                        if (!gravg[player.group]) {
                            gravg[player.group] = [];
                            grcount[player.group] = 0;
                            grBoonAvg[player.group] = 0;
                        }
                        totalcount++;
                        totalBoonAvg += stats[i].avg;
                        grBoonAvg[player.group] += stats[i].avg;
                        grcount[player.group]++;
                        for (var j = 0; j < stats[i].data.length; j++) {
                            totalavg[j] = (totalavg[j] || 0) + (stats[i].data[j][0] || 0);
                            gravg[player.group][j] = (gravg[player.group][j] || 0) + (stats[i].data[j][0] || 0);
                        }
                    }
                    for (i = 0; i < gravg.length; i++) {
                        if (gravg[i]) {
                            for (k = 0; k < gravg[i].length; k++) {
                                gravg[i][k] = Math.round(1000 * gravg[i][k] / grcount[i]) / 1000;
                            }
                            avg.push({
                                name: "Group " + i,
                                data: gravg[i],
                                avg: Math.round(1000 * grBoonAvg[i] / grcount[i]) / 1000
                            });
                        }
                    }
                    for (k = 0; k < totalavg.length; k++) {
                        totalavg[k] = Math.round(1000 * totalavg[k] / totalcount) / 1000;
                    }
                    avg.push({
                        name: "Total",
                        data: totalavg,
                        avg: Math.round(1000 * totalBoonAvg / totalcount) / 1000
                    });
                    return [uptimes, gens, gengr, genoff, gensq, avg];
                };
                var res;
                if (this.activeduration) {
                    res = {
                        boonsData: getData(this.phase.boonActiveStats, this.phase.boonGenActiveSelfStats,
                            this.phase.boonGenActiveGroupStats, this.phase.boonGenActiveOGroupStats, this.phase.boonGenActiveSquadStats),
                        offsData: getData(this.phase.offBuffActiveStats, this.phase.offBuffGenActiveSelfStats,
                            this.phase.offBuffGenActiveGroupStats, this.phase.offBuffGenActiveOGroupStats, this.phase.offBuffGenActiveSquadStats),
                        defsData: getData(this.phase.defBuffActiveStats, this.phase.defBuffGenActiveSelfStats,
                            this.phase.defBuffGenActiveGroupStats, this.phase.defBuffGenActiveOGroupStats, this.phase.defBuffGenActiveSquadStats),
                        supsData: getData(this.phase.supBuffActiveStats, this.phase.supBuffGenActiveSelfStats,
                            this.phase.supBuffGenActiveGroupStats, this.phase.supBuffGenActiveOGroupStats, this.phase.supBuffGenActiveSquadStats)
                    };
                } else {
                    res = {
                        boonsData: getData(this.phase.boonStats, this.phase.boonGenSelfStats,
                            this.phase.boonGenGroupStats, this.phase.boonGenOGroupStats, this.phase.boonGenSquadStats),
                        offsData: getData(this.phase.offBuffStats, this.phase.offBuffGenSelfStats,
                            this.phase.offBuffGenGroupStats, this.phase.offBuffGenOGroupStats, this.phase.offBuffGenSquadStats),
                        defsData: getData(this.phase.defBuffStats, this.phase.defBuffGenSelfStats,
                            this.phase.defBuffGenGroupStats, this.phase.defBuffGenOGroupStats, this.phase.defBuffGenSquadStats),
                        supsData: getData(this.phase.supBuffStats, this.phase.supBuffGenSelfStats,
                            this.phase.supBuffGenGroupStats, this.phase.supBuffGenOGroupStats, this.phase.supBuffGenSquadStats)
                    };
                }
                this.cache.set(id, res);
                return res;
            }
        },
    });
}
{
    Vue.component("buff-stats-target-component", {
        props: ['phaseindex', 'playerindex', 'targetindex'],
        template: `    <div>        <div>            <h3 class="text-center">Conditions</h3>            <buff-table-component :condition="true" :generation="true" :id="'condition-stats-table-' + target.id" :buffs="conditions"                :playerdata="condiData" :sums="condiSums" :playerindex="playerindex"></buff-table-component>        </div>        <div v-show="hasBoons" class="mt-2">            <h3 class="text-center">Boons</h3>            <buff-table-component :condition="false" :generation="false" :id="'buff-stats-table-' + target.id" :buffs="boons"                :playerdata="boonData" :sums="[]"></buff-table-component>        </div>    </div>`,
        data: function () {
            return {
                cacheCondi: new Map(),
                cacheCondiSums: new Map(),
                cacheBoon: new Map()
            };
        },
        computed: {
            boons: function() {
                var data = [];
                for (var i = 0; i < logData.boons.length; i++) {
                    data[i] = findSkill(true, logData.boons[i]);
                }
                return data;
            },
            conditions: function() {
                var data = [];
                for (var i = 0; i < logData.conditions.length; i++) {
                    data[i] = findSkill(true, logData.conditions[i]);
                }
                return data;
            },
            phase: function() {
                return logData.phases[this.phaseindex];
            },
            target: function() {
                return logData.targets[this.targetindex];
            },
            targetPhaseIndex: function () {
                return this.phase.targets.indexOf(this.targetindex);
            },
            hasBoons: function () {
                return this.phase.targetsBoonTotals[this.targetPhaseIndex];
            },
            condiData: function () {
                if (this.cacheCondi.has(this.phaseindex)) {
                    return this.cacheCondi.get(this.phaseindex);
                }
                var res = [];
                var i;
                if (this.targetPhaseIndex === -1) {
                    for (i = 0; i < logData.players.length; i++) {
                        res.push({
                            player: logData.players[i],
                            data: {
                                avg: 0.0,
                                data: []
                            }
                        });
                    }
                } else {
                    for (i = 0; i < logData.players.length; i++) {
                        res.push({
                            player: logData.players[i],
                            data: this.phase.targetsCondiStats[this.targetPhaseIndex][i]
                        });
                    }
                }
                this.cacheCondi.set(this.phaseindex, res);
                return res;
            },
            condiSums: function () {
                if (this.cacheCondiSums.has(this.phaseindex)) {
                    return this.cacheCondiSums.get(this.phaseindex);
                }
                var res = [];
                if (this.targetPhaseIndex === -1) {
                    res.push({
                        icon: this.target.icon,
                        name: this.target.name,
                        avg: 0,
                        data: []
                    });
                } else {
                    var targetData = this.phase.targetsCondiTotals[this.targetPhaseIndex];
                    res.push({
                        icon: this.target.icon,
                        name: this.target.name,
                        avg: targetData.avg,
                        data: targetData.data
                    });
                }
                this.cacheCondiSums.set(this.phaseindex, res);
                return res;
            },
            boonData: function () {
                if (this.cacheBoon.has(this.phaseindex)) {
                    return this.cacheBoon.get(this.phaseindex);
                }
                var res = [];
                if (this.targetPhaseIndex === -1 || !this.hasBoons) {
                    res.push({
                        player: this.target,
                        data: {
                            avg: 0.0,
                            data: []
                        }
                    });
                } else {
                    var targetData = this.phase.targetsBoonTotals[this.targetPhaseIndex];
                    res.push({
                        player: this.target,
                        data: targetData
                    });
                }
                this.cacheBoon.set(this.phaseindex, res);
                return res;
            }
        }
    });
}
{
    Vue.component("buff-table-component", {
        props: ["buffs", "playerdata", "generation", "condition", "sums", "id", "playerindex"],
        template: `    <div v-if="buffs.length > 0">        <img v-if="generation" class="mb-1 icon" src="https://i.imgur.com/nSYuby8.png"            :data-original-title="tooltipExpl" />        <table class="table table-sm table-striped table-hover" cellspacing="0" width="100%" :id="id">            <thead>                <tr>                    <th>Sub</th>                    <th></th>                    <th>Name</th>                    <th v-for="buff in buffs"                        :data-original-title="buff.name + (buff.description ? '<br> ' + buff.description : '')">                        <img :src="buff.icon" :alt="buff.name" class="icon icon-hover">                    </th>                </tr>            </thead>            <tbody>                <tr v-for="row in playerdata" :class="{active: row.player.group && row.player.id === playerindex}">                    <td>{{ row.player.group ? row.player.group : '-' }}</td>                    <td :data-original-title="row.player.profession ? row.player.profession : row.player.name">                        <img :src="row.player.icon"                            :alt="row.player.profession ? row.player.profession : row.player.name" class="icon">                        <span style="display:none">                            {{ row.player.profession ? row.player.profession : row.player.name}}                        </span>                    </td>                    <td class="text-left" :data-original-title="getAvgTooltip(row.data.avg)">                        {{ row.player.name }}                    </td>                    <td v-for=" (buff, index) in buffs"                        :data-original-title="getCellTooltip(buff, row.data.data[index])">                        {{ getCellValue(buff, row.data.data[index]) }}                    </td>                </tr>            </tbody>            <tfoot v-show="sums.length > 0">                <tr v-for="sum in sums">                    <td></td>                    <td v-if="sum.icon" :data-original-title="sum.name"><img :src="sum.icon" :alt="sum.name"                            class="icon"></td>                    <td v-else></td>                    <td class="text-left" :data-original-title="getAvgTooltip(sum.avg)">{{sum.name}}</td>                    <td v-for=" (buff, index) in buffs"                        :data-original-title="getCellTooltip(buff, sum.data[index], !!sum.icon)">                        {{ getCellValue(buff, sum.data[index]) }}                    </td>                </tr>            </tfoot>        </table>    </div>`,
        methods: {
            getAvgTooltip: function (avg) {
                if (avg) {
                    return (
                        "Average number of " +
                        (this.condition ? "conditions: " : "boons: ") +
                        avg
                    );
                }
                return false;
            },
            getCellTooltip: function (buff, val, uptime) {
                if (val instanceof Array) {
                    if (!uptime && this.generation && (val[1] > 0 || val[2] > 0 || val[3] > 0 || val[4] > 0)) {
                        var res = (val[1] || 0) + (buff.stacking ? "" : "%") + " with overstack";
                        if (val[4] > 0) {
                            res += "<br>";
                            res += val[4] + (buff.stacking ? "" : "%") + " by extension";
                        }
                        if (val[2] > 0) {
                            res += "<br>";
                            res += val[2] + (buff.stacking ? "" : "%") + " wasted";
                        }
                        if (val[5] > 0) {
                            res += "<br>";
                            res += val[5] + (buff.stacking ? "" : "%") + " extended";
                        }
                        if (val[3] > 0) {
                            res += "<br>";
                            res += val[3] + (buff.stacking ? "" : "%") + " extended by unknown source";
                        }
                        return res;
                    } else if (buff.stacking && val[1] > 0) {
                        return "Uptime: " + val[1] + "%";
                    } else {
                        return false;
                    }
                }
                return false;
            },
            getCellValue: function (buff, val) {
                var value = val;
                var force = false;
                if (val instanceof Array) {
                    value = val[0];
                    force = this.generation && (val[1] > 0 || val[2] > 0 || val[3] > 0 || val[4] > 0);
                }
                if (value > 0 || force) {
                    return buff.stacking ? value : value + "%";
                }
                return "-";
            }
        },
        computed: {
            tooltipExpl: function () {
                return `<ul style='text-align:left;margin-block-end: 0.3em;'>
                        <li>The value shown in the row is "generation + extensions you are the source"</li>
                        <li>With overstack is "generation + extensions you are the source + stacks that couldn't make into the queue/stacks"</li>
                        <li>By extension is "extensions you are the source"</li>
                        <li>Waste is "stacks that were overriden/cleansed". If you have high waste values that could mean there is an issue with your composition as someone may be overriding your stacks non-stop.</li>
                        <li>Extended by unknown source is the extension value for which we were unable to find an src, not included in generation.</li>
                        <li>Extended is "extended by unknown source + extended by known source other than yourself". Not included in generation. This value is just here to indicate if you are a good seed.</li>
                        </ul>`
            }
        },
        mounted() {
            initTable("#" + this.id, 0, "asc");
        },
        updated() {
            updateTable("#" + this.id);
        }
    });
}
{
    Vue.component('dmgdist-player-component', {
        props: ['playerindex',
            'phaseindex', 'activetargets'
        ],
        template: `    <div>        <div v-if="player.minions.length > 0">            <ul class="nav nav-tabs">                <li>                    <a class="nav-link" :class="{active: distmode === -1}" @click="distmode = -1">{{player.name}}</a>                </li>                <li v-for="(minion, mindex) in player.minions">                    <a class="nav-link" :class="{active: distmode === mindex}"                        @click="distmode = mindex">{{minion.name}}</a>                </li>            </ul>        </div>        <div v-if="!targetless" class="d-flex flex-row justify-content-center mt-1 mb-1">            <ul class="nav nav-pills scale85">                <li class="nav-item">                    <a class="nav-link" @click="targetmode = 1" :class="{active: targetmode}">Target</a>                </li>                <li class="nav-item">                    <a class="nav-link" @click="targetmode = 0" :class="{active: !targetmode }">All</a>                </li>            </ul>        </div>        <damagedist-table-component :dmgdist="targetmode === 0 ? dmgdist : dmgdisttarget"            :tableid="'dmgdist-' + playerindex" :actor="actor" :isminion="distmode>=0" :istarget="targetmode === 1"            :phaseindex="phaseindex"></damagedist-table-component>    </div>`,
        data: function () {
            return {
                distmode: -1,
                targetless: logData.targetless,
                targetmode: logData.targetless ? 0 : 1,
                cacheTarget: new Map()
            };
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            player: function () {
                return logData.players[this.playerindex];
            },
            actor: function () {
                if (this.distmode === -1) {
                    return this.player;
                }
                return this.player.minions[this.distmode];
            },
            dmgdist: function () {
                if (this.distmode === -1) {
                    return this.player.details.dmgDistributions[this.phaseindex];
                }
                return this.player.details.minions[this.distmode].dmgDistributions[this.phaseindex];
            },
            dmgdisttarget: function () {
                var cacheID = this.phaseindex + '-' + this.distmode + '-';
                cacheID += getTargetCacheID(this.activetargets);
                if (this.cacheTarget.has(cacheID)) {
                    return this.cacheTarget.get(cacheID);
                }
                var dist = {
                    contributedDamage: 0,
                    contributedShieldDamage: 0,
                    totalDamage: 0,
                    totalCasting: 0,
                    distribution: [],
                };
                var rows = new Map();
                for (var i = 0; i < this.activetargets.length; i++) {
                    var targetid = this.activetargets[i];
                    var targetDist = this.distmode === -1 ?
                        this.player.details.dmgDistributionsTargets[this.phaseindex][targetid] :
                        this.player.details.minions[this.distmode].dmgDistributionsTargets[this.phaseindex][targetid];
                    dist.contributedDamage += targetDist.contributedDamage;
                    dist.totalDamage += targetDist.totalDamage;
                    dist.contributedShieldDamage += targetDist.contributedShieldDamage;
                    dist.totalCasting += targetDist.totalCasting;
                    var distribution = targetDist.distribution;
                    for (var k = 0; k < distribution.length; k++) {
                        var targetDistribution = distribution[k];
                        if (rows.has(targetDistribution[1])) {
                            var row = rows.get(targetDistribution[1]);
                            row[2] += targetDistribution[2];
                            if (row[3] < 0) {
                                row[3] = targetDistribution[3];
                            } else if (targetDistribution[3] >= 0) {
                                row[3] = Math.min(targetDistribution[3], row[3]);
                            }
                            row[4] = Math.max(targetDistribution[4], row[4]);
                            row[6] += targetDistribution[6];
                            row[7] += targetDistribution[7];
                            row[8] += targetDistribution[8];
                            row[9] += targetDistribution[9];
                            // skip 10
                            // skip 11
                            row[12] += targetDistribution[12];
                            row[13] += targetDistribution[13];
                            row[14] += targetDistribution[14];
                            // skip 15
                        } else {
                            rows.set(targetDistribution[1], targetDistribution.slice(0));
                        }

                    }
                }
                rows.forEach(function (value, key, map) {
                    dist.distribution.push(value);
                });
                dist.contributedDamage = Math.max(dist.contributedDamage, 0);
                dist.totalDamage = Math.max(dist.totalDamage, 0);
                dist.contributedShieldDamage = Math.max(dist.contributedShieldDamage, 0);
                dist.totalCasting = Math.max(dist.totalCasting, 0);
                this.cacheTarget.set(cacheID, dist);
                return dist;
            }
        },
    });
}
{
    Vue.component("damagedist-table-component", {
        props: ["dmgdist", "tableid", "actor", "isminion", "istarget", "phaseindex"],
        template: `    <div>        <div v-if="actor !== null">            <div v-if="isminion">                {{actor.name}} did {{round3(100*dmgdist.contributedDamage/dmgdist.totalDamage)}}% of its master's total                {{istarget ? 'Target' :''}} dps            </div>            <div v-else>                {{actor.name}} did {{round3(100*dmgdist.contributedDamage/dmgdist.totalDamage)}}% of its total {{istarget ?                'Target' :''}} dps            </div>        </div>        <table class="table table-sm table-striped table-hover" cellspacing="0" width="100%" :id="tableid">            <thead>                <tr>                    <th class="text-left">Skill</th>                    <th>                        %                    </th>                    <th data-original-title="Damage">                        <img src="https://wiki.guildwars2.com/images/thumb/6/6a/Damage.png/30px-Damage.png" alt="Damage"                            class="icon icon-hover">                    </th>                    <th data-original-title="Damage against barrier. Not necessarily included in total damage">                        <img src="https://wiki.guildwars2.com/images/thumb/c/cc/Barrier.png/30px-Barrier.png"                            alt="Barrier Damage" class="icon icon-hover">                    </th>                    <th data-original-title="Minimum">                        Min                    </th>                    <th data-original-title="Average">                        Avg                    </th>                    <th data-original-title="Maximum">                        Max                    </th>                    <th v-if="actor !== null">                        Cast                    </th>                    <th>                        Hits                    </th>                    <th v-if="actor !== null" data-original-title="Hits per Cast">                        <img src="https://wiki.guildwars2.com/images/thumb/5/53/Number_of_targets.png/20px-Number_of_targets.png"                            alt="Hits per Cast" class="icon icon-hover">                    </th>                    <th v-if="actor !== null" data-original-title="Damage divided by time spent in animation">                        <img src="https://wiki.guildwars2.com/images/thumb/6/6a/Damage.png/30px-Damage.png" alt="Damage"                            class="icon">                        /                        <img src="https://wiki.guildwars2.com/images/6/6e/Activation.png" alt="Activation Time"                            class="icon">                    </th>                    <th data-original-title="Percent time hits critical">                        <img src="https://wiki.guildwars2.com/images/9/95/Critical_Chance.png" alt="Crits"                            class="icon icon-hover">                    </th>                    <th data-original-title="Percent time hits while flanking">                        <img src="https://wiki.guildwars2.com/images/b/bb/Hunter%27s_Tactics.png" alt="Flank"                            class="icon icon-hover">                    </th>                    <th data-original-title="Percent time hits while glancing">                        <img src="https://wiki.guildwars2.com/images/f/f9/Weakness.png" alt="Glance"                            class="icon icon-hover">                    </th>                    <th v-if="actor !== null" data-original-title="Time wasted interupting skill casts">                        <img src="https://wiki.guildwars2.com/images/b/b3/Out_Of_Health_Potions.png" alt="Wasted"                            class="icon icon-hover">                    </th>                    <th v-if="actor !== null" data-original-title="Time saved(in seconds) interupting skill casts">                        <img src="https://wiki.guildwars2.com/images/e/eb/Ready.png" alt="Saved"                            class="icon icon-hover">                    </th>                </tr>            </thead>            <tbody>                <tr v-for="row in dmgdist.distribution" :class="{condi: getSkill(row[0], row[1]).condi}">                    <td class="text-left" :data-original-title="row[1]">                        <img :src="getSkill(row[0], row[1]).icon" class="icon">                        {{getSkill(row[0],row[1]).name}}                    </td>                    <td>{{ round3(100*row[2]/dmgdist.contributedDamage) }}%</td>                    <td :data-original-title="round2(row[2]/phase.durationS) +' dps'">                        {{ row[2] }}                    </td>                    <td :data-original-title="round2(row[12]/phase.durationS) +' dps'">                        {{ row[12] }}                    </td>                    <td>{{ Math.max(row[3],0) }}</td>                    <td>{{ round(row[2]/row[6]) }}</td>                    <td>{{ row[4] }}</td>                    <td v-if="actor !== null">                        {{ !getSkill(row[0], row[1]).condi && row[5] ? (showInequality(getSkill(row[0], row[1]),row[15]) ? '>= ' : '') + row[5] : ''}}                    </td>                    <td :data-original-title="(row[14] - row[6]) + ' hit(s) not connected'">                        {{ row[6] }}                    </td>                    <td v-if="actor !== null" :data-original-title=" (!getSkill(row[0], row[1]).condi && row[14] && row[5]) ? (showInequality(getSkill(row[0], row[1]),row[15]) ? '<= ' : '') + round2(row[14]/row[5]) + ' with missed hits' : false" >                        {{(!getSkill(row[0], row[1]).condi && row[6] && row[5]) ? (showInequality(getSkill(row[0], row[1]),row[15]) ? '<= ' : '') + round2(row[6]/row[5]) : ''}}                    </td>                    <td v-if="actor !== null">                        {{(!getSkill(row[0], row[1]).condi && row[6] && row[15]) ? round2(row[2]/(0.001 * row[15])) : ''}}                    </td>                    <td                        :data-original-title="(!getSkill(row[0], row[1]).condi && row[6]) ? row[7] +' out of ' + row[6] + ' hit(s) <br> Damage: ' + row[13] : false">                        {{(!getSkill(row[0], row[1]).condi && row[6]) ? round2(row[7]*100/row[6]) + '%' : ''}}                    </td>                    <td                        :data-original-title="(!getSkill(row[0], row[1]).condi && row[6]) ? row[8] +' out of ' + row[6] + ' hit(s)': false">                        {{(!getSkill(row[0], row[1]).condi && row[6]) ? round2(row[8]*100/row[6]) + '%' : ''}}                    </td>                    <td                        :data-original-title="(!getSkill(row[0], row[1]).condi && row[6]) ? row[9] +' out of ' + row[6] + ' hit(s)': false">                        {{(!getSkill(row[0], row[1]).condi && row[6]) ? round2(row[9]*100/row[6]) + '%' : ''}}                    </td>                    <td v-if="actor !== null"                        :data-original-title="row[10] ? round2(100.0 * row[10]/phase.durationS) + '% of the phase' : false">                        {{ row[10] ? row[10] + 's' : ''}}</td>                    <td v-if="actor !== null"                        :data-original-title="row[11] ? round2(100.0 * row[11]/phase.durationS) + '% of the phase' : false">                        {{ row[11] ? row[11] + 's' : ''}}</td>                </tr>            </tbody>            <tfoot class="text-dark">                <tr>                    <td class="text-left">Total</td>                    <td></td>                    <td :data-original-title="Math.round(dmgdist.contributedDamage/phase.durationS) +' dps'">                        {{dmgdist.contributedDamage}}                    </td>                    <td :data-original-title="Math.round(dmgdist.contributedShieldDamage/phase.durationS) +' dps'">                        {{dmgdist.contributedShieldDamage}}                    </td>                    <td></td>                    <td></td>                    <td></td>                    <td v-if="actor !== null"></td>                    <td></td>                    <td v-if="actor !== null"></td>                    <td v-if="actor !== null">                        {{round2(dmgdist.contributedDamage/(0.001 * dmgdist.totalCasting))}}                    </td>                    <td></td>                    <td></td>                    <td></td>                    <td v-if="actor !== null"></td>                    <td v-if="actor !== null"></td>                </tr>            </tfoot>        </table>    </div>`,
        data: function () {
            return {
                sortdata: {
                    order: "desc",
                    index: 2
                }
            };
        },
        mixins: [roundingComponent],
        mounted() {
            var _this = this;
            initTable(
                "#" + this.tableid,
                this.sortdata.index,
                this.sortdata.order,
                function () {
                    var order = $("#" + _this.tableid)
                        .DataTable()
                        .order();
                    _this.sortdata.order = order[0][1];
                    _this.sortdata.index = order[0][0];
                }
            );
        },
        beforeUpdate() {
            $("#" + this.tableid)
                .DataTable()
                .destroy();
        },
        updated() {
            var _this = this;
            initTable(
                "#" + this.tableid,
                this.sortdata.index,
                this.sortdata.order,
                function () {
                    var order = $("#" + _this.tableid)
                        .DataTable()
                        .order();
                    _this.sortdata.order = order[0][1];
                    _this.sortdata.index = order[0][0];
                }
            );
        },
        methods: {
            getSkill: function (isBoon, id) {
                return findSkill(isBoon, id);
            },
            showInequality: function (skillData, castDuration) {
                return castDuration === 0 && skillData.notAccurate;
            },
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            }
        }
    });
}
{
    Vue.component('dmgdist-target-component', {
        props: ['targetindex',
            'phaseindex'
        ],
        template: `    <div>        <div v-if="target.minions.length > 0">            <ul class="nav nav-tabs">                <li>                    <a class="nav-link" :class="{active: distmode === -1}" @click="distmode = -1">{{target.name}}</a>                </li>                <li v-for="(minion, mindex) in target.minions">                    <a class="nav-link" :class="{active: distmode === mindex}" @click="distmode = mindex">{{minion.name}}</a>                </li>            </ul>        </div>        <damagedist-table-component :dmgdist="dmgdist" :tableid="'dmgdist-target-' + targetindex" :actor="actor" :isminion="distmode>=0" :phaseindex="phaseindex"></damagedist-table-component>    </div>`,
        data: function () {
            return {
                distmode: -1
            };
        },
        computed: {
            target: function() {
                return logData.targets[this.targetindex];
            },
            actor: function () {
                if (this.distmode === -1) {
                    return this.target;
                }
                return this.target.minions[this.distmode];
            },
            dmgdist: function () {
                if (this.distmode === -1) {
                    return this.target.details.dmgDistributions[this.phaseindex];
                }
                return this.target.details.minions[this.distmode].dmgDistributions[this.phaseindex];
            }
        },
    });
}
{
    Vue.component("dmgmodifier-table-component", {
        props: ['phaseindex', 'id', 'playerindex', 'playerindices', 'activetargets', 'modifiers', 'modifiersdata', 'mode', 'sum'],
        mixins: [roundingComponent],
        template: `    <div>        <table class="table table-sm table-striped table-hover" cellspacing="0" width="100%" :id="id">            <thead>                <tr>                    <th>Sub</th>                    <th></th>                    <th class="text-left">Name</th>                    <th v-for="modifier in modifiers" :data-original-title="modifier.name + '<br>' + modifier.tooltip">                        <img :src="modifier.icon" :alt="modifier.name" class="icon icon-hover">                    </th>                </tr>            </thead>            <tbody>                <tr v-for="row in (mode ? tableDataTarget.rows : tableData.rows)"                    :class="{active: row.player.id === playerindex}">                    <td>{{row.player.group}}</td>                    <td :data-original-title="row.player.profession">                        <img :src="row.player.icon" :alt="row.player.profession" class="icon"><span                            style="display:none">{{row.player.profession}}</span>                    </td>                    <td class="text-left">{{row.player.name}}</td>                    <td v-for="(modifier, index) in modifiers"                        :data-original-title="getTooltip(row.data[index], modifier)">                        {{getCellValue(row.data[index], modifier)}}                    </td>                </tr>            </tbody>            <tfoot v-if="sum">                <tr v-for="row in (mode ? tableDataTarget.sums : tableData.sums)">                    <td></td>                    <td></td>                    <td class="text-left">{{row.name}}</td>                    <td v-for="(modifier, index) in modifiers"                        :data-original-title="getTooltip(row.data[index], modifier)">                        {{getCellValue(row.data[index], modifier)}}                    </td>                </tr>            </tfoot>        </table>    </div>`,
        data: function () {
            return {
                cache: new Map(),
                cacheTarget: new Map()
            };
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            indicesToUse: function () {
                var res = [];
                if (this.playerindices !== null) {
                    for (var i = 0; i < this.playerindices.length; i++) {
                        res.push(this.playerindices[i]);
                    }
                    return res;
                }
                for (var i = 0; i < logData.players.length; i++) {
                    res.push(i);
                }
                return res;
            },
            tableData: function () {
                if (this.cache.has(this.phaseindex)) {
                    return this.cache.get(this.phaseindex);
                }
                var rows = [];
                var sums = [];
                var groups = [];
                var total = {
                    name: "Total",
                    data: []
                };
                var j;
                for (var i = 0; i < this.indicesToUse.length; i++) {
                    var index = this.indicesToUse[i];
                    var player = logData.players[index];
                    if (player.isConjure) {
                        continue;
                    }
                    if (!groups[player.group]) {
                        groups[player.group] = {
                            name: "Group" + player.group,
                            data: []
                        };
                    }
                    var dmgModifier = this.modifiersdata[index].data;
                    var data = [];
                    for (j = 0; j < this.modifiers.length; j++) {
                        data[j] = dmgModifier[j];
                        if (!groups[player.group].data[j]) {
                            groups[player.group].data[j] = [0, 0, 0, 0];
                        }
                        if (!total.data[j]) {
                            total.data[j] = [0, 0, 0, 0];
                        }
                        for (var k = 0; k < data[j].length; k++) {
                            groups[player.group].data[j][k] += data[j][k];
                            total.data[j][k] += data[j][k];
                        }
                    }
                    rows.push({
                        player: player,
                        data: data
                    });
                }
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i]) {
                        sums.push(groups[i]);
                    }
                }
                sums.push(total);
                var res = {
                    rows: rows,
                    sums: sums
                };
                this.cache.set(this.phaseindex, res);
                return res;
            },
            tableDataTarget: function () {
                var cacheID = this.phaseindex + '-';
                cacheID += getTargetCacheID(this.activetargets);
                if (this.cacheTarget.has(cacheID)) {
                    return this.cacheTarget.get(cacheID);
                }
                var rows = [];
                var sums = [];
                var groups = [];
                var total = {
                    name: "Total",
                    data: []
                };
                var j;
                for (var i = 0; i < this.indicesToUse.length; i++) {
                    var index = this.indicesToUse[i];
                    var player = logData.players[index];
                    if (player.isConjure) {
                        continue;
                    }
                    if (!groups[player.group]) {
                        groups[player.group] = {
                            name: "Group" + player.group,
                            data: []
                        };
                    }
                    var data = [];
                    for (j = 0; j < this.modifiers.length; j++) {
                        data[j] = [0, 0, 0, 0];
                        if (!groups[player.group].data[j]) {
                            groups[player.group].data[j] = [0, 0, 0, 0];
                        }
                        if (!total.data[j]) {
                            total.data[j] = [0, 0, 0, 0];
                        }
                    }
                    var dmgModifier = this.modifiersdata[index].dataTarget;
                    for (j = 0; j < this.activetargets.length; j++) {
                        var modifier = dmgModifier[this.activetargets[j]];
                        for (var k = 0; k < this.modifiers.length; k++) {
                            var targetData = modifier[k];
                            var curData = data[k];
                            for (var l = 0; l < targetData.length; l++) {
                                curData[l] += targetData[l];
                            }
                        }
                    }
                    for (j = 0; j < this.modifiers.length; j++) {
                        for (var k = 0; k < data[j].length; k++) {
                            groups[player.group].data[j][k] += data[j][k];
                            total.data[j][k] += data[j][k];
                        }
                    }
                    rows.push({
                        player: player,
                        data: data
                    });
                }
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i]) {
                        sums.push(groups[i]);
                    }
                }
                sums.push(total);
                var res = {
                    rows: rows,
                    sums: sums
                };
                this.cacheTarget.set(cacheID, res);
                return res;
            }
        },
        methods: {
            getTooltip: function (item, mod) {
                if (item[2] === 0) {
                    return null;
                }
                var hits = item[0] + " out of " + item[1] + " hits";
                var percent;
                if (mod.skillBased) {
                    percent = this.round3(1000.0 * item[1] / this.phase.duration) + " hits/s";
                } else {
                    percent = this.round3(100.0 * item[0] / item[1]) + " hit %";
                }
                var gain;
                if (mod.nonMultiplier) {
                    gain = "Damage Done: ";
                } else {
                    gain = "Pure Damage: ";
                }
                gain += this.round3(item[2]);
                return hits + "<br>" + percent + "<br>" + gain;
            },
            getCellValue: function (item, mod) {
                if (item[2] === 0) {
                    return '-';
                }
                if (mod.nonMultiplier) {
                    return 'Tooltip';
                }
                var damageIncrease = this.round3(100 * (item[3] / (item[3] - item[2]) - 1.0));
                if (Math.abs(damageIncrease) < 1e-6 || isNaN(damageIncrease)) {
                    return "-";
                }
                return damageIncrease + '%';
            }
        },
        mounted() {
            initTable("#" + this.id, 1, "asc");
        },
        updated() {
            updateTable("#" + this.id);
        },
    });
}
{
    Vue.component("dmgmodifier-stats-component", {
        props: ['phaseindex', 'playerindex', 'activetargets'],
        template: `    <div>        <ul class="nav nav-tabs">            <li v-if="itemModifiers.length > 0">                <a class="nav-link" :class="{active: displayMode === 0}" @click="displayMode = 0"> Gear Based Damage                    Modifiers </a>            </li>            <li v-if="commonModifiers.length > 0">                <a class="nav-link" :class="{active: displayMode === 1}" @click="displayMode = 1"> Shared Damage                    Modifiers </a>            </li>            <li>                <a class="nav-link" :class="{active: displayMode === 2}" @click="displayMode = 2"> Class Based Damage                    Modifiers </a>            </li>        </ul>        <ul class="nav nav-pills d-flex flex-row justify-content-center mt-1 mb-1 scale85">            <li class="nav-item">                <a class="nav-link" @click="mode = 1" :class="{active: mode}">Target</a>            </li>            <li class="nav-item">                <a class="nav-link" @click="mode = 0" :class="{active: !mode }">All</a>            </li>        </ul>        <keep-alive>            <dmgmodifier-table-component v-if="displayMode === 0" :key="'gear'" :phaseindex="phaseindex"                :playerindex="playerindex" :activetargets="activetargets" :mode="mode"                :id="'damage-modifier-item-table'" :playerindices="null" :modifiers="itemModifiers"                :modifiersdata="phase.dmgModifiersItem" :sum="true"></dmgmodifier-table-component>            <dmgmodifier-table-component v-if="displayMode === 1" :key="'common'" :phaseindex="phaseindex"                :playerindex="playerindex" :activetargets="activetargets" :mode="mode"                :id="'damage-modifier-common-table'" :playerindices="null" :modifiers="commonModifiers"                :modifiersdata="phase.dmgModifiersCommon" :sum="true"></dmgmodifier-table-component>            <dmgmodifier-persstats-component v-if="displayMode === 2" :key="'pers'" :phaseindex="phaseindex"                :playerindex="playerindex" :activetargets="activetargets" :mode="mode">            </dmgmodifier-persstats-component>        </keep-alive>    </div>`,
        data: function () {
            return {
                mode: 1,
                displayMode: logData.dmgModifiersItem.length > 0 ? 0 : logData.dmgModifiersCommon.length > 0 ? 1 : 2
            };
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            commonModifiers: function () {
                var modifiers = [];
                for (var i = 0; i < logData.dmgModifiersCommon.length; i++) {
                    modifiers.push(logData.damageModMap['d' + logData.dmgModifiersCommon[i]]);
                }
                return modifiers;
            },
            itemModifiers: function () {
                var modifiers = [];
                for (var i = 0; i < logData.dmgModifiersItem.length; i++) {
                    modifiers.push(logData.damageModMap['d' + logData.dmgModifiersItem[i]]);
                }
                return modifiers;
            }
        }
    });
}
{
    Vue.component("dmgmodifier-persstats-component", {
        props: ['phaseindex', 'playerindex', 'activetargets', 'mode'],
        template: `    <div>        <ul class="nav nav-pills d-flex flex-row justify-content-center mt-1 mb-1 scale85">            <li v-for="base in bases" class="nav-item">                <a class="nav-link" @click="specmode = base" :class="{active: specmode === base}">{{ base }}</a>            </li>        </ul>        <div>            <div v-for="(spec, index) in orderedSpecs" class="mt-1 mb-1">                <div v-show="specToBase[spec.name] === specmode">                    <h3 class="text-center">{{ spec.name }}</h3>                    <dmgmodifier-table-component :phaseindex="phaseindex" :playerindex="playerindex"                        :activetargets="activetargets" :mode="mode" :id="'damage-modifier-pers-table-'+spec.name"                        :modifiers="personalModifiers[index]" :playerindices="spec.ids"                        :modifiersdata="phase.dmgModifiersPers" :sum="false"></dmgmodifier-table-component>                </div>            </div>        </div>    </div>`,
        data: function () {
            return {
                bases: [],
                specmode: "Warrior",
                specToBase: specToBase
            };
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            orderedSpecs: function () {
                var res = [];
                var aux = new Set();
                for (var i = 0; i < specs.length; i++) {
                    var spec = specs[i];
                    var pBySpec = [];
                    for (var j = 0; j < logData.players.length; j++) {
                        if (logData.players[j].profession === spec && logData.phases[0].dmgModifiersPers[j].data.length > 0) {
                            pBySpec.push(j);
                        }
                    }
                    if (pBySpec.length) {
                        aux.add(specToBase[spec]);
                        res.push({
                            ids: pBySpec,
                            name: spec
                        });
                    }
                }
                this.bases = [];
                var _this = this;
                aux.forEach(function (value, value2, set) {
                    _this.bases.push(value);
                });
                this.specmode = this.bases[0];
                return res;
            },
            personalModifiers: function () {
                var res = [];
                for (var i = 0; i < this.orderedSpecs.length; i++) {
                    var spec = this.orderedSpecs[i];
                    var data = [];
                    for (var j = 0; j < logData.dmgModifiersPers[spec.name].length; j++) {
                        data.push(logData.damageModMap['d' + logData.dmgModifiersPers[spec.name][j]]);
                    }
                    res.push(data);
                }
                return res;
            }
        }
    });
}
{
    Vue.component("damage-stats-component", {
        props: ["activetargets", "playerindex", "phaseindex"],
        template: `    <div>        <table class="table table-sm table-striped table-hover" cellspacing="0" width="100%" id="dps-table">            <thead>                <tr>                    <th>Sub</th>                    <th></th>                    <th class="text-left">Name</th>                    <th>Account</th>                    <th v-show="!targetless" v-if="!showDamage">Target DPS</th>                    <th v-show="!targetless" v-else>Target Damage</th>                    <th v-show="!targetless">Power</th>                    <th v-show="!targetless">Condi</th>                    <th v-if="!showDamage">All DPS</th>                    <th v-else>All Damage</th>                    <th>Power</th>                    <th>Condi</th>                </tr>            </thead>            <tbody>                <tr v-for="row in tableData.rows" :class="{active: row.player.id === playerindex}">                    <td>{{row.player.group}}</td>                    <td :data-original-title="row.player.profession">                        <img :src="row.player.icon" :alt="row.player.profession" class="icon"><span                            style="display:none">{{row.player.profession}}</span>                    </td>                    <td class="text-left">{{row.player.name}}</td>                    <td>{{row.player.acc}}</td>                    <td v-show="!targetless" v-if="!showDamage"                        :data-original-title="row.dps[0] + ' dmg'+ '<br>' + computeTotalContribution(0, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 0, row.dps,tableData.sums)">                        {{round(row.dps[0]/phase.durationS)}}</td>                    <td v-show="!targetless" v-else                        :data-original-title="round(row.dps[0]/phase.durationS) + ' dps'+ '<br>' + computeTotalContribution(0, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 0, row.dps,tableData.sums)">                        {{row.dps[0]}}</td>                    <td v-show="!targetless" v-if="!showDamage"                        :data-original-title="row.dps[1] + ' dmg'+ '<br>' + computeTotalContribution(1, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 1, row.dps,tableData.sums)">                        {{round(row.dps[1]/phase.durationS)}}</td>                    <td v-show="!targetless" v-else                        :data-original-title="round(row.dps[1]/phase.durationS) + ' dps'+ '<br>' + computeTotalContribution(1, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 1, row.dps,tableData.sums)">                        {{row.dps[1]}}</td>                    <td v-show="!targetless" v-if="!showDamage"                        :data-original-title="row.dps[2] + ' dmg'+ '<br>' + computeTotalContribution(2, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 2, row.dps,tableData.sums)">                        {{round(row.dps[2]/phase.durationS)}}</td>                    <td v-show="!targetless" v-else                        :data-original-title="round(row.dps[2]/phase.durationS) + ' dps'+ '<br>' + computeTotalContribution(2, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 2, row.dps,tableData.sums)">                        {{row.dps[2]}}</td>                    <td v-if="!showDamage"                        :data-original-title="row.dps[3] + ' dmg'+ '<br>' + computeTotalContribution(3, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 3, row.dps,tableData.sums)">                        {{round(row.dps[3]/phase.durationS)}}</td>                    <td v-else                        :data-original-title="round(row.dps[3]/phase.durationS) + ' dps'+ '<br>' + computeTotalContribution(3, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 3, row.dps,tableData.sums)">                        {{row.dps[3]}}</td>                    <td v-if="!showDamage"                        :data-original-title="row.dps[4] + ' dmg'+ '<br>' + computeTotalContribution(4, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 4, row.dps,tableData.sums)">                        {{round(row.dps[4]/phase.durationS)}}</td>                    <td v-else                        :data-original-title="round(row.dps[4]/phase.durationS) + ' dps'+ '<br>' + computeTotalContribution(4, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 4, row.dps,tableData.sums)">                        {{row.dps[4]}}</td>                    <td v-if="!showDamage"                        :data-original-title="row.dps[5] + ' dmg'+ '<br>' + computeTotalContribution(5, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 5, row.dps,tableData.sums)">                        {{round(row.dps[5]/phase.durationS)}}</td>                    <td v-else                        :data-original-title="round(row.dps[5]/phase.durationS) + ' dps'+ '<br>' + computeTotalContribution(5, row.dps,tableData.sums)+ '<br>'+ computeGroupContribution(row.player.group, 5, row.dps,tableData.sums)">                        {{row.dps[5]}}</td>                </tr>            </tbody>            <tfoot>                <tr v-for="sum in tableData.sums">                    <td></td>                    <td></td>                    <td class="text-left">{{sum.name}}</td>                    <td></td>                    <td v-show="!targetless" v-if="!showDamage" :data-original-title="sum.dps[0] + ' dmg'">                        {{round(sum.dps[0]/phase.durationS)}}</td>                    <td v-show="!targetless" v-else :data-original-title="round(sum.dps[0]/phase.durationS) + ' dps'">                        {{sum.dps[0]}}</td>                    <td v-show="!targetless" v-if="!showDamage" :data-original-title="sum.dps[1] + ' dmg'">                        {{round(sum.dps[1]/phase.durationS)}}</td>                    <td v-show="!targetless" v-else :data-original-title="round(sum.dps[1]/phase.durationS) + ' dps'">                        {{sum.dps[1]}}</td>                    <td v-show="!targetless" v-if="!showDamage" :data-original-title="sum.dps[2] + ' dmg'">                        {{round(sum.dps[2]/phase.durationS)}}</td>                    <td v-show="!targetless" v-else :data-original-title="round(sum.dps[2]/phase.durationS) + ' dps'">                        {{sum.dps[2]}}</td>                    <td v-if="!showDamage" :data-original-title="sum.dps[3] + ' dmg'">                        {{round(sum.dps[3]/phase.durationS)}}</td>                    <td v-else :data-original-title="round(sum.dps[3]/phase.durationS) + ' dps'">{{sum.dps[3]}}</td>                    <td v-if="!showDamage" :data-original-title="sum.dps[4] + ' dmg'">                        {{round(sum.dps[4]/phase.durationS)}}</td>                    <td v-else :data-original-title="round(sum.dps[4]/phase.durationS) + ' dps'">{{sum.dps[4]}}</td>                    <td v-if="!showDamage" :data-original-title="sum.dps[5] + ' dmg'">                        {{round(sum.dps[5]/phase.durationS)}}</td>                    <td v-else :data-original-title="round(sum.dps[5]/phase.durationS) + ' dps'">{{sum.dps[5]}}</td>                </tr>            </tfoot>        </table>    </div>`,
        mixins: [roundingComponent],
        data: function () {
            return {
                targetless: logData.targetless,
                showDamage: logData.wvw,
                cacheTarget: new Map()
            };
        },
        mounted() {
            initTable("#dps-table", logData.targetless ? 7 : 4, "desc");
        },
        updated() {
            updateTable("#dps-table");
        },
        methods: {
            computeTotalContribution: function (index, row, sums) {
                return this.round2(row[index] * 100 / sums[sums.length - 1].dps[index]) + '% of total';
            },
            computeGroupContribution: function (groupIndex, index, row, sums) {
                var sumId = 0;
                for (var sumId = 0; sumId < sums.length; sumId++) {
                    if (sums[sumId].name.includes(groupIndex)) {
                        break;
                    }
                }
                return this.round2(row[index] * 100 / sums[sumId].dps[index]) + '% of group';
            }
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            tableData: function () {
                var cacheID = this.phaseindex + '-';
                cacheID += getTargetCacheID(this.activetargets);
                if (this.cacheTarget.has(cacheID)) {
                    return this.cacheTarget.get(cacheID);
                }
                var rows = [];
                var sums = [];
                var total = [0, 0, 0, 0, 0, 0];
                var groups = [];
                var i, j;
                for (i = 0; i < this.phase.dpsStats.length; i++) {
                    var dpsStat = this.phase.dpsStats[i];
                    var dpsTargetStat = [0, 0, 0];
                    for (j = 0; j < this.activetargets.length; j++) {
                        var tar = this.phase.dpsStatsTargets[i][this.activetargets[j]];
                        for (var k = 0; k < dpsTargetStat.length; k++) {
                            dpsTargetStat[k] += tar[k];
                        }
                    }
                    var player = logData.players[i];
                    if (!groups[player.group]) {
                        groups[player.group] = [0, 0, 0, 0, 0, 0];
                    }
                    var dps = dpsTargetStat.concat(dpsStat);
                    for (j = 0; j < dps.length; j++) {
                        total[j] += dps[j];
                        groups[player.group][j] += dps[j];
                    }
                    rows.push({
                        player: player,
                        dps: dps
                    });
                }
                for (i = 0; i < groups.length; i++) {
                    if (groups[i]) {
                        sums.push({
                            name: "Group " + i,
                            dps: groups[i]
                        });
                    }
                }
                sums.push({
                    name: "Total",
                    dps: total
                });
                var res = {
                    rows: rows,
                    sums: sums
                };
                this.cacheTarget.set(cacheID, res);
                return res;
            }
        }
    });
}
{
    Vue.component('dmgtaken-component', {
        props: ['actor', 'tableid',
            'phaseindex'
        ],
        template: `    <damagedist-table-component :dmgdist="dmgtaken" :tableid="tableid" :actor="null" :isminion="false" :istarget="false"        :phaseindex="phaseindex">    </damagedist-table-component>`,
        computed: {
            dmgtaken: function () {
                return this.actor.details.dmgDistributionsTaken[this.phaseindex];
            }
        },
    });
}
{
    Vue.component("deathrecap-component", {
        props: ["playerindex", "phaseindex"],
        template: `    <div>        <div v-if="recaps">            <div v-for="index in phaseRecaps">                <h3 v-if="phaseRecaps.length > 1" class="text-center">                    Death #{{index + 1}}                </h3>                <div v-if="!recaps[index].toKill">                    <h3 class="text-center">Player was instantly killed after down</h3>                    <div class="text-center">                        Took {{data.totalDamage.down[index]}}                        damage to go into downstate in                        {{data.totalSeconds.down[index]}} seconds                    </div>                </div>                <div v-else-if="!recaps[index].toDown">                    <h3 class="text-center">Player was instantly killed</h3>                    <div class="text-center">                        Took {{data.totalDamage.kill[index]}}                        damage in {{data.totalSeconds.kill[index]}} seconds before                        dying                    </div>                </div>                <div v-else>                    <div class="text-center">                        Took {{data.totalDamage.down[index]}}                        damage to go into downstate in                        {{data.totalSeconds.down[index]}} seconds                    </div>                    <div class="text-center">                        Took {{data.totalDamage.kill[index]}}                        damage in {{data.totalSeconds.kill[index]}} seconds before                        dying afterwards                    </div>                </div>                <graph-component :id="'deathrecap-' + playerindex + '-' + index" :layout="data.layout"                    :data="[data.data[index]]"></graph-component>            </div>            <div v-show="phaseRecaps === null || phaseRecaps.length === 0">                <h3 class="text-center">Player has never died during this phase</h3>            </div>        </div>        <div v-else>            <h3 class="text-center">Player has never died</h3>        </div>    </div>`,
        mixins: [roundingComponent],
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            recaps: function () {
                return logData.players[this.playerindex].details.deathRecap;
            },
            data: function () {
                if (!this.recaps) {
                    return null;
                }
                var res = {
                    totalSeconds: {
                        down: [],
                        kill: []
                    },
                    totalDamage: {
                        down: [],
                        kill: []
                    },
                    data: [],
                    layout: {}
                };
                for (var i = 0; i < this.recaps.length; i++) {
                    var recap = this.recaps[i];
                    var data = {
                        y: [],
                        x: [],
                        type: 'bar',
                        text: [],
                        hoverinfo: 'y+text',
                        marker: {
                            color: []
                        }
                    };
                    var j, totalSec, totalDamage;
                    if (recap.toDown) {
                        totalSec = (recap.toDown[0][0] - recap.toDown[recap.toDown.length - 1][0]) / 1000;
                        totalDamage = 0;
                        for (j = recap.toDown.length - 1; j >= 0; j--) {
                            totalDamage += recap.toDown[j][2];
                            data.x.push(this.round3(recap.toDown[j][0] / 1000 - this.phase.start));
                            data.y.push(recap.toDown[j][2]);
                            data.text.push(recap.toDown[j][3] + ' - ' + findSkill(recap.toDown[j][4], recap.toDown[j][1]).name);
                            data.marker.color.push('rgb(0,255,0,1)');
                        }
                        res.totalSeconds.down[i] = totalSec;
                        res.totalDamage.down[i] = totalDamage;
                    }
                    if (recap.toKill) {
                        totalSec = (recap.toKill[0][0] - recap.toKill[recap.toKill.length - 1][0]) / 1000;
                        totalDamage = 0;
                        for (j = recap.toKill.length - 1; j >= 0; j--) {
                            totalDamage += recap.toKill[j][2];
                            data.x.push(this.round3(recap.toKill[j][0] / 1000 - this.phase.start));
                            data.y.push(recap.toKill[j][2]);
                            data.text.push(recap.toKill[j][3] + ' - ' + findSkill(recap.toKill[j][4], recap.toKill[j][1]).name);
                            data.marker.color.push(recap.toDown ? 'rgb(255,0,0,1)' : 'rgb(0,255,0,1)');
                        }
                        res.totalSeconds.kill[i] = totalSec;
                        res.totalDamage.kill[i] = totalDamage;
                    }
                    res.data.push(data);
                }
                res.layout = {
                    title: 'Damage Taken',
                    font: {
                        color: '#ffffff'
                    },
                    width: 1100,
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    showlegend: false,
                    bargap: 0.05,
                    yaxis: {
                        title: 'Damage'
                    },
                    xaxis: {
                        title: 'Time(seconds)',
                        type: 'category'
                    }
                };
                return res;
            },
            phaseRecaps: function () {
                if (!this.recaps) {
                    return null;
                }
                var res = [];
                for (var i = 0; i < this.recaps.length; i++) {
                    var time = this.recaps[i].time / 1000.0;
                    if (this.phase.start <= time && this.phase.end >= time) {
                        res.push(i);
                    }
                }
                return res;
            }
        }
    });
}
{
    Vue.component("defense-stats-component", {
        props: ["phaseindex", "playerindex"],
        template: `    <div>        <table class="table table-sm table-striped table-hover" cellspacing="0" width="100%" id="def-table">            <thead>                <tr>                    <th>Sub</th>                    <th></th>                    <th class="text-left">Name</th>                    <th>Account</th>                    <th data-original-title="Damage taken" >                        <img src="https://wiki.guildwars2.com/images/thumb/6/6a/Damage.png/30px-Damage.png" alt="Damage Taken"                        class="icon icon-hover">                    </th>                    <th data-original-title="Damage absorbed by barrier">                        <img src="https://wiki.guildwars2.com/images/thumb/c/cc/Barrier.png/30px-Barrier.png" alt="Damage Barrier"                        class="icon icon-hover">                    </th>                    <th data-original-title="Number of times blocked an attack" >                        <img src="https://wiki.guildwars2.com/images/e/e5/Aegis.png" alt="Blocked"                            class="icon icon-hover">                    </th>                    <th data-original-title="Number of times was invulnerable to damage">                        <img src="https://wiki.guildwars2.com/images/e/eb/Determined.png" alt="Ivuln"                             class="icon icon-hover">                    </th>                    <th data-original-title="Number of times interrupted">                        <img src="https://wiki.guildwars2.com/images/7/79/Daze.png" alt="Interrupted"                                                        class="icon icon-hover">                    </th>                    <th data-original-title="Number of evades">                        <img src="https://wiki.guildwars2.com/images/e/e2/Evade.png" alt="Evaded"                             class="icon icon-hover">                    </th>                    <th data-original-title="Number of dodge + mirage cloak" >                        <img src="https://wiki.guildwars2.com/images/b/b2/Dodge.png" alt="Dodge"                            class="icon icon-hover">                    </th>                    <th data-original-title="Number of hits missed against" >                        <img src="https://wiki.guildwars2.com/images/3/33/Blinded.png" alt="Missed"                            class="icon icon-hover">                    </th>                    <th data-original-title="Times downed">                        <img src="https://wiki.guildwars2.com/images/c/c6/Downed_enemy.png" alt="Downs"                             class="icon icon-hover">                    </th>                    <th  data-original-title="Times died">                        <img src="https://wiki.guildwars2.com/images/4/4a/Ally_death_%28interface%29.png" alt="Dead"                            class="icon icon-hover">                    </th>                </tr>            </thead>            <tbody>                <tr v-for="row in tableData.rows" :class="{active: row.player.id === playerindex}">                    <td>{{row.player.group}}</td>                    <td :data-original-title="row.player.profession">                        <img :src="row.player.icon" :alt="row.player.profession" class="icon"><span                            style="display:none">{{row.player.profession}}</span>                    </td>                    <td class="text-left">{{row.player.name}}</td>                    <td>{{row.player.acc}}</td>                    <td>{{row.def[0]}}</td>                    <td>{{row.def[1]}}</td>                    <td>{{row.def[2]}}</td>                    <td>                        {{row.def[3]}}                    </td>                    <td>{{row.def[4]}}</td>                    <td>{{row.def[5]}}</td>                    <td>{{row.def[6]}}</td>                    <td>{{row.def[7]}}</td>                    <td :data-original-title="row.def[9]">{{row.def[8]}}</td>                    <td :data-original-title="row.def[11]">{{row.def[10]}}</td>                </tr>            </tbody>            <tfoot>                <tr v-for="sum in tableData.sums">                    <td></td>                    <td></td>                    <td class="text-left">{{sum.name}}</td>                    <td></td>                    <td>{{sum.def[0]}}</td>                    <td>{{sum.def[1]}}</td>                    <td>{{sum.def[2]}}</td>                    <td>                        {{sum.def[3]}}                    </td>                    <td>{{sum.def[4]}}</td>                    <td>{{sum.def[5]}}</td>                    <td>{{sum.def[6]}}</td>                    <td>{{sum.def[7]}}</td>                    <td>{{sum.def[8]}}</td>                    <td>{{sum.def[10]}}</td>                </tr>            </tfoot>        </table>    </div>`,
        data: function () {
            return {
                cache: new Map()
            };
        },
        mounted() {
            initTable("#def-table", 4, "desc");
        },
        updated() {
            updateTable("#def-table");
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            tableData: function () {
                if (this.cache.has(this.phaseindex)) {
                    return this.cache.get(this.phaseindex);
                }
                var rows = [];
                var sums = [];
                var total = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                var groups = [];
                var i;
                for (i = 0; i < this.phase.defStats.length; i++) {
                    var def = this.phase.defStats[i];
                    var player = logData.players[i];
                    if (player.isConjure) {
                        continue;
                    }
                    rows.push({
                        player: player,
                        def: def
                    });
                    if (!groups[player.group]) {
                        groups[player.group] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    }
                    for (var j = 0; j < total.length; j++) {
                        total[j] += def[j];
                        groups[player.group][j] += def[j];
                    }
                }
                for (i = 0; i < groups.length; i++) {
                    if (groups[i]) {
                        sums.push({
                            name: "Group " + i,
                            def: groups[i]
                        });
                    }
                }
                sums.push({
                    name: "Total",
                    def: total
                });
                var res = {
                    rows: rows,
                    sums: sums
                };
                this.cache.set(this.phaseindex, res);
                return res;
            }
        }
    });
}
{
    Vue.component("encounter-component", {
        props: [],
        template: `    <div class="card fight-summary" style="min-width: 350px;">        <h3 class="card-header text-center">{{ encounter.name }}</h3>        <div class="card-body container">            <div class="d-flex flex-row justify-content-center align-items-center">                <div class="d-flex flex-column mr-3 justify-content-center">                    <div v-if="fractalInstabilities" class="d-flex flex-row justify-content-around">                        <img v-for="fractalInstability in fractalInstabilities"                            :data-original-title="fractalInstability.name + (fractalInstability.description ? '<br> ' + fractalInstability.description : '')"                            :src="fractalInstability.icon" class="icon icon-hover" />                    </div>                    <img class="icon-xl" :src="encounter.icon" :alt="encounter.name">                </div>                <div class="ml-3 d-flex flex-column justify-content-center">                    <div class="mb-2" v-for="target in encounter.targets">                        <div v-if="encounter.targets.length > 1" class="small" style="text-align:center;">                            {{target.name}}                        </div>                        <div :style="{'background': getGradient(target.hpLeft ? target.hpLeft : 0), 'height': '10px', 'width': '100%', 'border-radius': '5px'}"                            :data-original-title="(target.hpLeft ? target.hpLeft : 0) + '% left'">                        </div>                        <div class="small" style="text-align:center;">                            {{ target.health }} Health                        </div>                    </div>                    <div class="mb-2 text" :class="resultStatus.class">                        Result: {{resultStatus.text}}                    </div>                    <div class="mb-2">Duration: {{ encounter.duration }}</div>                </div>            </div>        </div>    </div>`,
        methods: {
            getGradient: function (percent) {
                var template = 'linear-gradient(to right, $left$, $middle$, $right$)';
                var greenPercent = "green " + (100 - percent) + "%";
                var redPercent = "red " + (percent) + "%";
                var middle = percent + "%";
                template = template.replace('$right$', greenPercent);
                template = template.replace('$left$', redPercent);
                template = template.replace('$middle$', middle);
                return template;
            }
        },
        computed: {
            encounter: function () {
                var targets = [];
                for (var i = 0; i < logData.phases[0].targets.length; i++) {
                    var targetData = logData.targets[logData.phases[0].targets[i]];
                    targets.push(targetData);
                }

                var encounter = {
                    name: logData.fightName,
                    icon: logData.fightIcon,
                    duration: logData.encounterDuration,
                    targets: targets
                };
                return encounter;
            },
            resultStatus: function () {
                return logData.success ? { text: 'Success', class: ["text-success"] } : { text: 'Failure', class: ["text-warning"] };
            },
            fractalInstabilities: function () {
                if (logData.fractalInstabilities.length == 0) {
                    return null;
                }
                var res = [];
                for (var i = 0; i < logData.fractalInstabilities.length; i++) {
                    res.push(findSkill(true, logData.fractalInstabilities[i]));
                }
                return res;
            },
        }
    });
}
{
    Vue.component("food-component", {
        props: ["phaseindex", "playerindex"],
        template: `    <div class="mt-2">        <div v-if="data.start.length">            Started with:            <ul>                <li v-for="initial in data.start">                    {{initial.name}} <img class="icon" :alt="initial.name" :data-original-title="initial.description"                        :src="initial.icon">                    {{initial.stack > 1 ? "("+initial.stack+")" : ""}} ({{initial.duration}}                    seconds remaining)                </li>            </ul>        </div>        <div v-if="data.refreshed.length">            In phase consumable updates:            <ul>                <li v-for="refresh in data.refreshed">                    {{refresh.dimished ? 'suffered' : 'consumed'}} {{refresh.name}}                    <img class="icon" :alt="refresh.name" :data-original-title="refresh.description"                        :src="refresh.icon">                    {{refresh.stack > 1 ? "("+refresh.stack+")" : ""}}                    at {{round3(refresh.time - phase.start)}}s ({{refresh.duration}}                    seconds)                </li>            </ul>        </div>        <div v-if="!data.refreshed.length && !data.start.length" class="text-center">            <h3>No consumable activity</h3>        </div>    </div>`,
        data: function () {
            return {
                cache: new Map()
            };
        },
        mixins: [roundingComponent],
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            food: function () {
                return logData.players[this.playerindex].details.food;
            },
            data: function () {
                if (this.cache.has(this.phase)) {
                    return this.cache.get(this.phase);
                }
                var res = {
                    start: [],
                    refreshed: []
                };
                for (var k = 0; k < this.food.length; k++) {
                    var foodData = this.food[k];
                    if (!foodData.name) {
                        var skill = findSkill(true, foodData.id);
                        foodData.name = skill.name;
                        foodData.icon = skill.icon;
                        foodData.description = skill.description;
                    }
                    if (foodData.time >= this.phase.start && foodData.time <= this.phase.end) {
                        if (foodData.time === 0) {
                            res.start.push(foodData);
                        } else {
                            res.refreshed.push(foodData);
                        }
                    }
                }
                this.cache.set(this.phase, res);
                return res;
            }
        }
    });
}
{
    var commonOffset = 14;

    Vue.component("gameplay-stats-component", {
        props: ["activetargets", "playerindex", "phaseindex"],
        template: `    <div>        <div v-if="!targetless" class="d-flex flex-row justify-content-center mt-1 mb-1">            <ul class="nav nav-pills scale85">                <li class="nav-item">                    <a class="nav-link" @click="mode = 1" :class="{active: mode}">Target</a>                </li>                <li class="nav-item">                    <a class="nav-link" @click="mode = 0" :class="{active: !mode }">All</a>                </li>            </ul>        </div>        <table class="table table-sm table-striped table-hover" cellspacing="0" width="100%" id="dmg-table">            <thead>                <tr>                    <th>Sub</th>                    <th></th>                    <th class="text-left">Name</th>                    <th>Account</th>                    <th data-original-title="Percent time hits critical">                        <img src="https://wiki.guildwars2.com/images/9/95/Critical_Chance.png" alt="Crits"                             class="icon icon-hover">                    </th>                    <th data-original-title="Percent time hits while flanking">                        <img src="https://wiki.guildwars2.com/images/b/bb/Hunter%27s_Tactics.png" alt="Flank"                             class="icon icon-hover">                    </th>                    <th data-original-title="Percent time hits while glancing">                        <img src="https://wiki.guildwars2.com/images/f/f9/Weakness.png" alt="Glance"                             class="icon icon-hover">                    </th>                    <th data-original-title="Number of hits while blinded">                        <img src="https://wiki.guildwars2.com/images/3/33/Blinded.png" alt="Miss"                             class="icon icon-hover">                    </th>                    <th data-original-title="Number of hits used to interupt">                        <img src="https://wiki.guildwars2.com/images/7/79/Daze.png" alt="Interupts"                                                        class="icon icon-hover">                    </th>                    <th data-original-title="Times the enemy was invulnerable to attacks">                        <img src="https://wiki.guildwars2.com/images/e/eb/Determined.png" alt="Ivuln"                             class="icon icon-hover">                    </th>                    <th data-original-title="Times the enemy evaded an attack">                        <img src="https://wiki.guildwars2.com/images/e/e2/Evade.png" alt="Evaded"                             class="icon icon-hover">                    </th>                    <th data-original-title="Times the enemy blocked an attack">                        <img src="https://wiki.guildwars2.com/images/e/e5/Aegis.png" alt="Blocked"                             class="icon icon-hover">                    </th>                                      <th v-if="wvw" data-original-title="Number of times downed target">                        <img src="https://wiki.guildwars2.com/images/c/c6/Downed_enemy.png"                            alt="Downed"                             class="icon icon-hover">                    </th>                                 <th v-if="wvw" data-original-title="Number of times killed target">                        <img src="https://wiki.guildwars2.com/images/4/4a/Ally_death_%28interface%29.png"                            alt="Killed"                             class="icon icon-hover">                    </th>                    <th data-original-title="Time wasted(in seconds) interupting skill casts">                        <img src="https://wiki.guildwars2.com/images/b/b3/Out_Of_Health_Potions.png" alt="Wasted"                                                        class="icon icon-hover">                    </th>                    <th data-original-title="Time saved(in seconds) interupting skill casts">                        <img src="https://wiki.guildwars2.com/images/e/eb/Ready.png" alt="Saved"                                                        class="icon icon-hover">                    </th>                    <th data-original-title="Times weapon swapped">                        <img src="https://wiki.guildwars2.com/images/c/ce/Weapon_Swap_Button.png" alt="Swap"                             class="icon icon-hover">                    </th>                    <th  data-original-title="Average Distance to the center of the squad">                        <img src="https://wiki.guildwars2.com/images/e/ef/Commander_arrow_marker.png" alt="Stack Center"                            class="icon icon-hover">                    </th>                    <th v-if="hasCommander" data-original-title="Average Distance to the commander">                        <img src="https://wiki.guildwars2.com/images/5/54/Commander_tag_%28blue%29.png"                            alt="Stack Commander"                             class="icon icon-hover">                    </th>                </tr>            </thead>            <tbody>                <tr v-for="row in (mode ? tableDataTarget.rows : tableData.rows)"                    :class="{active: row.player.id === playerindex}">                    <td>{{row.player.group}}</td>                    <td :data-original-title="row.player.profession">                        <img :src="row.player.icon" :alt="row.player.profession" class="icon"><span                            style="display:none">{{row.player.profession}}</span>                    </td>                    <td class="text-left">{{row.player.name}}</td>                    <td>{{row.player.acc}}</td>                    <td                        :data-original-title="row.data[2] + ' out of ' + row.data[1] + ' critable hit(s)<br>Total Damage Critical Damage: ' + row.data[3]">                        {{round2(100*row.data[2] / row.data[1])}}%                    </td>                    <td :data-original-title="row.data[4] + ' out of ' + row.data[11] + ' connected hit(s)'">                        {{round2(100*row.data[4]/ row.data[11])}}%                    </td>                    <td :data-original-title="row.data[5] + ' out of ' + row.data[11] + ' connected hit(s)'">                        {{round2(100*row.data[5]/ row.data[11])}}%                    </td>                    <td :data-original-title="round2(100*row.data[6]/ row.data[0]) + '% of hit(s)'">                        {{row.data[6]}}                    </td>                    <td :data-original-title="round2(100*row.data[7]/ row.data[11]) + '% connected hit(s)'">                        {{row.data[7]}}                    </td>                    <td>                        {{row.data[8]}}                    </td>                    <td :data-original-title="round2(100*row.data[9]/ row.data[0]) + '% of hit(s)'">                        {{row.data[9]}}                    </td>                    <td :data-original-title="round2(100*row.data[10]/ row.data[0]) + '% of hit(s)'">                        {{row.data[10]}}                    </td>                    <td v-if="wvw">                        {{row.data[13]}}                    </td>                    <td v-if="wvw">                        {{row.data[12]}}                    </td>                    <td                        :data-original-title="row.commons[1] + ' cancels <br>' + round2(100.0 * row.commons[0] / phase.durationS) + '% of the phase'">                        {{row.commons[0]}}                    </td>                    <td                        :data-original-title="row.commons[3] + ' cancels <br>' + round2(100.0 * row.commons[2] / phase.durationS) + '% of the phase'">                        {{row.commons[2]}}                    </td>                    <td>{{row.commons[4]}}</td>                    <td>{{row.commons[5]}}</td>                    <td v-if="hasCommander">{{row.commons[6]}}</td>                </tr>            </tbody>            <tfoot>                <tr v-for="row in (mode ? tableDataTarget.sums : tableData.sums)">                    <td></td>                    <td></td>                    <td class="text-left">{{row.name}}</td>                    <td></td>                    <td                        :data-original-title="row.data[2] + ' out of ' + row.data[1] + ' critable hit(s)<br>Total Damage Critical Damage: ' + row.data[3]">                        {{round2(100*row.data[2] / row.data[1])}}%                    </td>                    <td :data-original-title="row.data[4] + ' out of ' + row.data[11] + ' connected hit(s)'">                        {{round2(100*row.data[4]/ row.data[11])}}%                    </td>                    <td :data-original-title="row.data[5] + ' out of ' + row.data[11] + ' connected hit(s)'">                        {{round2(100*row.data[5]/ row.data[11])}}%                    </td>                    <td :data-original-title="round2(100*row.data[6]/ row.data[0])+ '% of hit(s)'">                        {{row.data[6]}}                    </td>                    <td :data-original-title="round2(100*row.data[7]/ row.data[11]) + '% connected hit(s)'">                        {{row.data[7]}}                    </td>                    <td>                        {{row.data[8]}}                    </td>                    <td :data-original-title="round2(100*row.data[9]/ row.data[0])+ '% of hit(s)'">                        {{row.data[9]}}                    </td>                    <td :data-original-title="round2(100*row.data[10]/ row.data[0]) + '% of hit(s)'">                        {{row.data[10]}}                    </td>                    <td v-if="wvw">                        {{row.data[13]}}                    </td>                    <td v-if="wvw">                        {{row.data[12]}}                    </td>                    <td :data-original-title="row.commons[1] + ' cancels'">{{round3(row.commons[0])}}</td>                    <td :data-original-title="row.commons[3] + ' cancels'">{{round3(row.commons[2])}}</td>                    <td>{{row.commons[4]}}</td>                    <td>{{round2(row.commons[5] / row.count)}}</td>                    <td v-if="hasCommander">{{round2(row.commons[6] / row.count)}}</td>                </tr>            </tfoot>        </table>    </div>`,
        mixins: [roundingComponent],
        data: function () {
            return {
                targetless: logData.targetless,
                wvw: logData.wvw,
                mode: logData.targetless ? 0 : 1,
                hasCommander: logData.hasCommander,
                cache: new Map(),
                cacheTarget: new Map()
            };
        },
        mounted() {
            initTable("#dmg-table", 1, "desc");
        },
        updated() {
            updateTable("#dmg-table");
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            tableData: function () {
                if (this.cache.has(this.phaseindex)) {
                    return this.cache.get(this.phaseindex);
                }
                var rows = [];
                var sums = [];
                var groups = [];
                var total = {
                    name: "Total",
                    data: [],
                    commons: [],
                    count: 0
                };
                for (var i = 0; i < this.phase.dmgStats.length; i++) {
                    var commons = [];
                    var data = [];
                    var player = logData.players[i];
                    if (player.isConjure) {
                        continue;
                    }
                    if (!groups[player.group]) {
                        groups[player.group] = {
                            name: "Group " + player.group,
                            data: [],
                            commons: [],
                            count: 0
                        };
                    }
                    groups[player.group].count++;
                    total.count++;
                    var stats = this.phase.dmgStats[i];
                    for (var j = 0; j < stats.length; j++) {
                        if (j >= commonOffset) {
                            commons[j - commonOffset] = stats[j];
                            groups[player.group].commons[j - commonOffset] = (groups[player.group].commons[j - commonOffset] || 0) + commons[j - commonOffset];
                            total.commons[j - commonOffset] = (total.commons[j - commonOffset] || 0) + commons[j - commonOffset];
                        } else {
                            data[j] = stats[j];
                            groups[player.group].data[j] = (groups[player.group].data[j] || 0) + data[j];
                            total.data[j] = (total.data[j] || 0) + data[j];
                        }
                    }
                    rows.push({
                        player: player,
                        commons: commons,
                        data: data
                    });
                }
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i]) {
                        sums.push(groups[i]);
                    }
                }
                sums.push(total);
                var res = {
                    rows: rows,
                    sums: sums
                };
                this.cache.set(this.phaseindex, res);
                return res;
            },
            tableDataTarget: function () {
                var cacheID = this.phaseindex + '-';
                cacheID += getTargetCacheID(this.activetargets);
                if (this.cacheTarget.has(cacheID)) {
                    return this.cacheTarget.get(cacheID);
                }
                var rows = [];
                var sums = [];
                var groups = [];
                var total = {
                    name: "Total",
                    data: [],
                    commons: [],
                    count: 0
                };
                for (var i = 0; i < this.phase.dmgStats.length; i++) {
                    var commons = [];
                    var data = [];
                    var player = logData.players[i];
                    if (player.isConjure) {
                        continue;
                    }
                    if (!groups[player.group]) {
                        groups[player.group] = {
                            name: "Group " + player.group,
                            data: [],
                            commons: [],
                            count: 0
                        };
                    }
                    groups[player.group].count++;
                    total.count++;
                    var stats = this.phase.dmgStats[i];
                    for (var j = 0; j < stats.length; j++) {
                        if (j >= commonOffset) {
                            commons[j - commonOffset] = stats[j];
                            groups[player.group].commons[j - commonOffset] = (groups[player.group].commons[j - commonOffset] || 0) + commons[j - commonOffset];
                            total.commons[j - commonOffset] = (total.commons[j - commonOffset] || 0) + commons[j - commonOffset];
                        } else {
                            if (this.activetargets.length > 0) {
                                for (var k = 0; k < this.activetargets.length; k++) {
                                    var tar = this.phase.dmgStatsTargets[i][this.activetargets[k]];
                                    data[j] = (data[j] || 0) + tar[j];
                                }
                            } else {
                                data[j] = (data[j] || 0);
                            }             
                            groups[player.group].data[j] = (groups[player.group].data[j] || 0) + data[j];
                            total.data[j] = (total.data[j] || 0) + data[j];
                        }
                    }
                    rows.push({
                        player: player,
                        commons: commons,
                        data: data
                    });
                }
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i]) {
                        sums.push(groups[i]);
                    }
                }
                sums.push(total);
                var res = {
                    rows: rows,
                    sums: sums
                };
                this.cacheTarget.set(cacheID, res);
                return res;
            }
        }
    });
}
{
    Vue.component("buff-tables-component", {
        props: ["phaseindex", "playerindex"],
        template: `    <div>        <ul class="nav nav-tabs">            <li>                <a class="nav-link" :class="{active: tab === 0}" @click="tab = 0">Boons</a>            </li>            <li v-if="hasOffBuffs">                <a class="nav-link" :class="{active: tab === 1}" @click="tab = 1">Offensive Buffs</a>            </li>            <li v-if="hasSupBuffs">                <a class="nav-link" :class="{active: tab === 2}" @click="tab = 2">Support Buffs</a>            </li>            <li v-if="hasDefBuffs">                <a class="nav-link" :class="{active: tab === 3}" @click="tab = 3">Defensive Buffs</a>            </li>            <li v-if="hasPersBuffs">                <a class="nav-link" :class="{active: tab === 4}" @click="tab = 4">Personal Buffs</a>            </li>        </ul>        <div :key="'activeduration'" class="d-flex flex-row justify-content-center mt-1 mb-1">            <ul class="nav nav-pills d-flex flex-row justify-content-center scale85">                <li class="nav-item">                    <a class="nav-link" @click="activeduration = 0" :class="{active: activeduration === 0}">Phase duration</a>                </li>                <li class="nav-item">                    <a class="nav-link" @click="activeduration = 1" data-original-title="Removed dead time and dc time"                        :class="{active: activeduration === 1 }">Phase active duration</a>                </li>            </ul>        </div>           <keep-alive>            <buff-stats-component v-if="tab < 4"                :key="'buffs'" :type="tab" :phaseindex="phaseindex"                :playerindex="playerindex" :activeduration="activeduration"></buff-stats-component>            <personal-buff-table-component v-if="tab === 4" :key="'persbuffs'"                :phaseindex="phaseindex" :playerindex="playerindex" :activeduration="activeduration">        </keep-alive>         </div>    `,
        data: function () {
            return {
                activeduration: 0,
                tab: 0,
            };
        },
        computed: {
            hasOffBuffs: function() {
                return logData.offBuffs.length > 0;
            },
            hasDefBuffs: function() {
                return logData.defBuffs.length > 0;
            },
            hasSupBuffs: function() {
                return logData.supBuffs.length > 0;
            },
            hasPersBuffs: function () {
                var hasPersBuffs = false;
                if (logData.persBuffs) {
                    for (var prop in logData.persBuffs) {
                        if (logData.persBuffs.hasOwnProperty(prop) && logData.persBuffs[prop].length > 0) {
                            hasPersBuffs = true;
                            break;
                        }
                    }
                }
                return hasPersBuffs;
            },
        }
    });
}
{
    Vue.component("stat-tables-component", {
        props: ["phaseindex", "playerindex", "activetargets"],
        template: `    <div>        <ul class="nav nav-tabs">            <li>                <a class="nav-link" :class="{active: tab === 0}" @click="tab = 0">Damage Stats</a>            </li>            <li>                <a class="nav-link" :class="{active: tab === 1}" @click="tab = 1">Gameplay Stats</a>            </li>            <li>                <a class="nav-link" :class="{active: tab === 2}" @click="tab = 2">Defensive Stats</a>            </li>            <li>                <a class="nav-link" :class="{active: tab === 3}" @click="tab = 3">Support Stats</a>            </li>        </ul>        <keep-alive>            <damage-stats-component v-if="tab === 0" :key="'damage'" :phaseindex="phaseindex"                :playerindex="playerindex" :activetargets="activetargets"></damage-stats-component>            <gameplay-stats-component v-if="tab === 1" :key="'gameplay'"                :phaseindex="phaseindex" :playerindex="playerindex" :activetargets="activetargets">            </gameplay-stats-component>            <defense-stats-component v-if="tab === 2" :key="'defense'" :phaseindex="phaseindex"                :playerindex="playerindex"></defense-stats-component>            <support-stats-component v-if="tab === 3" :key="'support'" :phaseindex="phaseindex"                :playerindex="playerindex"></support-stats-component>        </keep-alive>    </div>`,
        data: function () {
            return {
                tab: 0,
            };
        },
    });
}
{
    Vue.component("mechanics-stats-component", {
        props: ["phaseindex", "playerindex"],
        template: `    <div>        <table v-if="playerMechHeader.length > 0" class="table table-sm table-striped table-hover" cellspacing="0" id="playermechs">            <thead>                <tr>                    <th width="30px">Sub</th>                    <th width="30px"></th>                    <th class="text-left">Player</th>                    <th v-for="mech in playerMechHeader" :data-original-title="mech.description">                        {{ mech.shortName}}                    </th>                </tr>            </thead>            <tbody>                <tr v-for="row in playerMechRows" :class="{active: row.player.id === playerindex}">                    <td>{{row.player.group}}</td>                    <td :data-original-title="row.player.profession">                        <img :src="row.player.icon" :alt="row.player.profession" class="icon">                        <span style="display:none">{{row.player.profession}}</span>                    </td>                    <td class="text-left">{{row.player.name}}</td>                    <td v-for="mech in row.mechs" :data-original-title="mech[1] !== mech[0] ? mech[1] + ' times (multi hits)' : false">                        {{ mech[0] ? mech[0] : '-'}}                    </td>                </tr>            </tbody>        </table>        <table v-if="enemyMechHeader.length > 0" class="table table-sm table-striped table-hover" cellspacing="0" id="enemymechs">            <thead>                <tr>                    <th class="text-left">Enemy</th>                    <th v-for="mech in enemyMechHeader" :data-original-title="mech.description">                        {{ mech.shortName}}                    </th>                </tr>            </thead>            <tbody>                <tr v-for="row in enemyMechRows">                    <td class="text-left">{{row.enemy}}</td>                    <td v-for="mech in row.mechs" :data-original-title="mech[1] !== mech[0] ? mech[1] + ' times (multi hits)' : false">                        {{mech[0] ? mech[0] : '-'}}                    </td>                </tr>            </tbody>        </table>    </div>`,
        data: function () {
            return {
                cacheP: new Map(),
                cacheE: new Map()
            };
        },
        mounted() {
            initTable("#playermechs", 0, "asc");
            //
            if (this.enemyMechHeader.length) {
                initTable("#enemymechs", 0, "asc");
            }
        },
        updated() {
            updateTable("#playermechs");
            //
            if (this.enemyMechHeader.length) {
                updateTable("#enemymechs");
            }
        },
        computed: {
            phase: function() {
                return logData.phases[this.phaseindex];
            },
            playerMechHeader: function () {
                var playerMechanics = [];
                for (var i = 0; i < logData.mechanicMap.length; i++) {
                    var mech = logData.mechanicMap[i];
                    if (mech.playerMech) {
                        playerMechanics.push(mech);
                    }
                }
                return playerMechanics;
            },
            playerMechRows: function () {
                if (this.cacheP.has(this.phaseindex)) {
                    return this.cacheP.get(this.phaseindex);
                }
                var players = logData.players;
                var rows = [];
                for (var i = 0; i < players.length; i++) {
                    var player = players[i];
                    if (player.isConjure) {
                        continue;
                    }
                    rows.push({
                        player: player,
                        mechs: this.phase.mechanicStats[i]
                    });
                }
                this.cacheP.set(this.phaseindex, rows);
                return rows;
            },
            enemyMechHeader: function () {
                var enemyMechanics = [];
                for (var i = 0; i < logData.mechanicMap.length; i++) {
                    var mech = logData.mechanicMap[i];
                    if (mech.enemyMech) {
                        enemyMechanics.push(mech);
                    }
                }
                return enemyMechanics;
            },
            enemyMechRows: function () {
                if (this.cacheE.has(this.phaseindex)) {
                    return this.cacheE.get(this.phaseindex);
                }
                var enemies = logData.enemies;
                var rows = [];
                for (var i = 0; i < enemies.length; i++) {
                    var enemy = enemies[i];
                    rows.push({
                        enemy: enemy.name,
                        mechs: this.phase.enemyMechanicStats[i]
                    });
                }
                this.cacheE.set(this.phaseindex, rows);
                return rows;
            }
        }
    });
}
{
    Vue.component("personal-buff-table-component", {
        props: ['phaseindex', 'playerindex', 'activeduration'],
        template: `    <div>        <ul class="nav nav-pills d-flex flex-row justify-content-center mt-1 mb-1 scale85">            <li v-for="base in bases" class="nav-item">                <a class="nav-link" @click="mode = base" :class="{active: mode === base}">{{ base }}</a>            </li>        </ul>        <div v-for="(spec, id) in orderedSpecs" class="mt-1 mb-1">            <div v-show="specToBase[spec.name] === mode">                <h3 class="text-center">{{ spec.name }}</h3>                <buff-table-component :target="null" :condition="false" :generation="false" :id="'persbuffs-stats-table' + '_' + spec.name"                    :buffs="buffs[id]" :playerdata="data[id]" :sums="[]" :playerindex="playerindex"></buff-table-component>            </div>        </div>    </div>`,
        data: function () {
            return {
                bases: [],
                mode: "Warrior",
                cache: new Map(),
                specToBase: specToBase
            };
        },
        computed: {
            phase: function() {
                return logData.phases[this.phaseindex];
            },
            orderedSpecs: function () {
                var res = [];
                var aux = new Set();
                for (var i = 0; i < specs.length; i++) {
                    var spec = specs[i];
                    var pBySpec = [];
                    for (var j = 0; j < logData.players.length; j++) {
                        if (logData.players[j].profession === spec && logData.phases[0].persBuffStats[j].data.length > 0) {
                            pBySpec.push(j);
                        }
                    }
                    if (pBySpec.length) {
                        aux.add(specToBase[spec]);
                        res.push({
                            ids: pBySpec,
                            name: spec
                        });
                    }
                }
                this.bases = [];
                var _this = this;
                aux.forEach(function (value, value2, set) {
                    _this.bases.push(value);
                });
                this.mode = this.bases[0];
                return res;
            },
            data: function () {
				var id = this.phaseindex + '-' + this.activeduration;
                if (this.cache.has(id)) {
                    return this.cache.get(id);
                }
                var res = [];
                for (var i = 0; i < this.orderedSpecs.length; i++) {
                    var spec = this.orderedSpecs[i];
                    var dataBySpec = [];
                    for (var j = 0; j < spec.ids.length; j++) {
                        dataBySpec.push({
                            player: logData.players[spec.ids[j]],
                            data: this.activeduration ? this.phase.persBuffActiveStats[spec.ids[j]] : this.phase.persBuffStats[spec.ids[j]]
                        });
                    }
                    res.push(dataBySpec);
                }
                this.cache.set(id, res);
                return res;
            },
            buffs: function () {
                var res = [];
                for (var i = 0; i < this.orderedSpecs.length; i++) {
                    var spec = this.orderedSpecs[i];
                    var data = [];
                    for (var j = 0; j < logData.persBuffs[spec.name].length; j++) {
                        data.push(findSkill(true, logData.persBuffs[spec.name][j]));
                    }
                    res.push(data);
                }
                return res;
            }
        }
    });
}
{
    Vue.component("phase-component", {
        props: ["phases"],
        template: `    <div v-if="phases.length > 1">        <ul v-if="hasNormalPhases" class="nav nav-pills d-flex flex-row justify-content-center">            <li class="nav-item" v-for="(phase, id) in phases" v-show="!getPhaseData(id).breakbarPhase"                :data-original-title="getPhaseData(id).durationS + ' seconds'">                <a class="nav-link" @click="select(phase)" :class="{active: phase.active}">{{getPhaseData(id).name}}</a>            </li>        </ul>        <div v-if="hasBreakbarPhases" class="d-flex flew-row justify-content-center align-items-center">            <span class="mr-1">Breakbar Phases: </span>            <div v-for="data in breakbarPhasesPerTarget"                class="d-flex flew-row justify-content-center align-items-center mr-1 ml-1">                <img class="icon-l mr-2" :src="getTargetData(data.targetId).icon"                    :alt="getTargetData(data.targetId).name" :data-original-title="getTargetData(data.targetId).name"                    v-if="breakbarPhasesPerTarget.length > 1">                <ul class="nav nav-pills d-flex flex-row justify-content-center">                    <li class="nav-item" v-for="(phaseId, id) in data.phaseIds"                        v-show="getPhaseData(phaseId).breakbarPhase"                        :data-original-title="getPhaseData(phaseId).durationS + ' seconds'">                        <a class="nav-link" @click="select(getReactivePhaseData(phaseId))"                            :class="{active: getReactivePhaseData(phaseId).active}">{{id + 1}}</a>                    </li>                </ul>            </div>        </div>    </div>`,
        computed: {
            hasNormalPhases: function () {
                return logData.phases.filter(phase => !phase.breakbarPhase).length > 0;
            },
            hasBreakbarPhases: function () {
                return this.breakbarPhasesPerTarget.length > 0;
            },
            breakbarPhasesPerTarget: function () {
                var res = [];
                for (var targetId = 0; targetId < logData.targets.length; targetId++) {
                    var brPhases = logData.phases.filter(phase => phase.breakbarPhase && phase.targets.indexOf(targetId) > -1);
                    var phaseIds = [];
                    for (var brPhaseId = 0; brPhaseId < brPhases.length; brPhaseId++) {
                        phaseIds.push(logData.phases.indexOf(brPhases[brPhaseId]));
                    }
                    if (phaseIds.length > 0) {
                        res.push({ targetId: targetId, phaseIds: phaseIds });
                    }
                }
                return res;
            },
        },
        methods: {
            select: function (phase) {
                for (var i = 0; i < this.phases.length; i++) {
                    this.phases[i].active = false;
                }
                phase.active = true;
            },
            getPhaseData: function (id) {
                return logData.phases[id];
            },
            getReactivePhaseData: function (id) {
                return this.phases[id];
            },
            getTargetData: function (id) {
                return logData.targets[id];
            }
        }
    });
}
{
    Vue.component("player-component", {
        props: ["playerindex", "players"],
        template: `    <div>        <img class="icon mb-1" src="https://i.imgur.com/nSYuby8.png" :data-original-title="scoreExpl" />        <table class="table table-sm table-bordered composition">            <tbody>                <tr v-for="group in groups">                    <td v-for="player in group" class="player-cell" :class="{active: player.id === playerindex}"                        @click="select(player.id)">                        <div>                            <img :src="player.icon" :alt="player.profession" class="icon"                                 :data-original-title="player.profession">                            <img v-if="player.condi > 0"                                 src="https://wiki.guildwars2.com/images/5/54/Condition_Damage.png"                                 alt="Condition Damage" class="icon"                                 :data-original-title="'Condition Damage: ' + player.condi">                            <img v-if="player.conc > 0" src="https://wiki.guildwars2.com/images/4/44/Boon_Duration.png"                                 alt="Concentration" class="icon" :data-original-title="'Concentration: ' + player.conc">                            <img v-if="player.heal > 0" src="https://wiki.guildwars2.com/images/8/81/Healing_Power.png"                                 alt="Healing Power" class="icon" :data-original-title="'Healing Power: ' + player.heal">                            <img v-if="player.tough > 0" src="https://wiki.guildwars2.com/images/1/12/Toughness.png"                                 alt="Toughness" class="icon" :data-original-title="'Toughness: ' + player.tough">                        </div>                        <div v-if="player.l1Set.length > 0 || player.l2Set.length > 0">                            <img v-for="wep in player.l1Set" :src="getIcon(wep)" :data-original-title="wep"                                 class="icon">                            <span v-if="player.l1Set.length > 0 && player.l2Set.length > 0">/</span>                            <img v-for="wep in player.l2Set" :src="getIcon(wep)" :data-original-title="wep"                                 class="icon">                        </div>                        <div v-if="player.a1Set.length > 0 || player.a2Set.length > 0">                            <img v-for="wep in player.a1Set" :src="getIcon(wep)" :data-original-title="wep"                                 class="icon">                            <span v-if="player.a1Set.length > 0 && player.a2Set.length > 0">/</span>                            <img v-for="wep in player.a2Set" :src="getIcon(wep)" :data-original-title="wep"                                 class="icon">                        </div>                        <div class="shorten">                            <img v-if="player.isCommander"                                 src="https://wiki.guildwars2.com/images/5/54/Commander_tag_%28blue%29.png"                                 alt="Commander" class="icon" data-original-title="Commander">                            <span :data-original-title="player.acc">                                {{ player.name }}                            </span>                        </div>                    </td>                </tr>            </tbody>        </table>    </div>`,
        methods: {
            getIcon: function (path) {
                return urls[path];
            },
            select: function (id) {
                for (var i = 0; i < this.players.length; i++) {
                    this.players[i].active = false;
                }
                this.players[id].active = true;
            }
        },
        computed: {
            scoreExpl: function () {
                return "<span style='text-align:left;display: block;'>Scores are relative to the squad. 10 means that that player had the highest stat in the squad. 8 means that that player had between 80% and 89% of the highest scored player's stat.</span>"
            },
            groups: function () {
                var aux = [];
                var i = 0;
                for (i = 0; i < logData.players.length; i++) {
                    var playerData = logData.players[i];
                    if (playerData.isConjure) {
                        continue;
                    }
                    if (!aux[playerData.group]) {
                        aux[playerData.group] = [];
                    }
                    aux[playerData.group].push(playerData);
                }

                var noUndefinedGroups = [];
                for (i = 0; i < aux.length; i++) {
                    if (aux[i]) {
                        noUndefinedGroups.push(aux[i]);
                    }
                }
                return noUndefinedGroups;
            }
        }
    });
}
{
    Vue.component("player-stats-component", {
        props: ["phaseindex", 'activetargets', 'activeplayer', 'light'],
        template: `    <div>        <h3 v-for="player in players" :key="player.id" v-if="!player.isConjure" v-show="player.id === activeplayer"            class="text-center mt-2"><img :alt="player.profession" class="icon" :src="player.icon">{{player.name}}</h3>        <ul class="nav nav-tabs" v-show="activeplayer > -1">            <li>                <a class="nav-link" :class="{active: tabmode === 0}" @click="tabmode = 0">                    Damage                    Distribution                </a>            </li>            <li>                <a class="nav-link" :class="{active: tabmode === 1}" @click="tabmode = 1">                    Damage                    Taken                </a>            </li>            <li>                <a class="nav-link" :class="{active: tabmode === 2}" @click="tabmode = 2">Graph</a>            </li>            <li>                <a class="nav-link" :class="{active: tabmode === 3}" @click="tabmode = 3">                    Simple                    Rotation                </a>            </li>            <li>                <a class="nav-link" :class="{active: tabmode === 4}" @click="tabmode = 4">                    Consumables                </a>            </li>            <li>                <a class="nav-link" v-show="hasDeaths" :class="{active: tabmode === 5}" @click="tabmode = 5">                    Death                    Recap                </a>            </li>        </ul>        <keep-alive>            <player-tab-component v-for="player in players" :key="player.id"                v-if="player.id === activeplayer && !player.isConjure" :playerindex="player.id" :tabmode="tabmode"                :phaseindex="phaseindex" :activetargets="activetargets" :light="light"></player-tab-component>        </keep-alive>        <div v-if="activeplayer === -1">            <h3 class="text-center">No player selected</h3>        </div>    </div>`,
        data: function () {
            return {
                tabmode: 0
            };
        },
        computed: {
            players: function () {
                return logData.players;
            },
            hasDeaths: function () {
                for (var i = 0; i < this.players.length; i++) {
                    if (!!this.players[i].details.deathRecap) {
                        return true;
                    }
                }
                return false;
            }
        }
    });
}
{
    Vue.component('player-tab-component', {
        props: ['playerindex', 'tabmode',
            'phaseindex', 'activetargets', 'light'
        ],
        template: `    <div>        <keep-alive>            <dmgdist-player-component v-if="tabmode === 0" :key="'dist' + playerindex" :playerindex="playerindex"                :phaseindex="phaseindex" :activetargets="activetargets"></dmgdist-player-component>            <dmgtaken-component v-if="tabmode ===1" :key="'taken' + playerindex" :actor="player"                :tableid="'dmgtaken-player-'+playerindex" :phaseindex="phaseindex"></dmgtaken-component>            <player-graph-tab-component v-for="(ph, id) in phases" v-if="tabmode === 2 && id === phaseindex" :key="id"                :playerindex="playerindex" :phaseindex="id" :activetargets="activetargets" :light="light">            </player-graph-tab-component>            <simplerotation-component v-if="tabmode === 3" :key="'rot' + playerindex" :playerindex="playerindex"                :phaseindex="phaseindex"></simplerotation-component>            <food-component v-if="tabmode === 4" :key="'cons' + playerindex" :playerindex="playerindex"                :phaseindex="phaseindex"></food-component>            <deathrecap-component v-if="tabmode === 5" :key="'recap' + playerindex" :playerindex="playerindex"                :phaseindex="phaseindex"></deathrecap-component>        </keep-alive>    </div>`,
        computed: {
            phases: function () {
                return logData.phases;
            },
            player: function () {
                return logData.players[this.playerindex];
            }
        }
    });
}
{
    Vue.component("simplerotation-component", {
        props: ["playerindex", "phaseindex"],
        template: `    <div>        <div class="d-flex flex-row justify-content-center mt-1 mb-1">            <ul class="nav nav-pills mr-1 scale85">                <li class="nav-item">                    <a class="nav-link" @click="autoattack = !autoattack" :class="{active: autoattack}">Show auto                        attacks</a>                </li>                <li class="nav-item">                    <a class="nav-link" @click="hideInterruptedAA = !hideInterruptedAA"                        :class="{active: hideInterruptedAA}">Hide interrupted auto attacks</a>                </li>                <li class="nav-item">                    <a class="nav-link" @click="hideInstantCast = !hideInstantCast"                        :class="{active: hideInstantCast}">Hide instant cast</a>                </li>            </ul>            <ul class="nav nav-pills ml-1 scale85">                <li class="nav-item">                    <a class="nav-link" @click="small = !small" :class="{active: small}">Small icons</a>                </li>                <li class="nav-item">                    <a class="nav-link" @click="smallAA = !smallAA" :class="{active: smallAA}">Small auto attack                        icons</a>                </li>            </ul>        </div>        <span class="rot-skill" v-for="rota in rotation"            :class="{'rot-swap': isSwap(rota[1]) ,'mb-1': isSwap(rota[1]), 'rot-small': small || (smallAA && getSkill(rota[1]).aa)}"            v-show="showSkill(rota)">            <img class="rot-icon"                :class="{'rot-cancelled': rota[3] === 2, 'rot-animfull': rota[3] === 3, 'rot-unknown': rota[3] === 0, 'rot-instant': rota[3] === 4}"                :src="getSkill(rota[1]).icon"                :data-original-title="getSkill(rota[1]).name + ', Time: ' + rota[0] + 's, Dur: ' + rota[2] + 'ms'">        </span>        <div class="card mt-2">            <div class="card-body container">                <p><u>Outline</u></p>                <span class="mr-1"                    style="padding: 2px; background-color:#999999; border-style:solid; border-width: 3px; border-color:#00FF00; color:#000000">                    Full After Cast                </span>                <span class="mr-1"                    style="padding: 2px; background-color:#999999; border-style:solid; border-width: 3px; border-color:#FF0000; color:#000000">                    Interrupted                </span>                <span class="mr-1"                     style="padding: 2px; background-color:#999999; border-style:solid; border-width: 3px; border-color:#00FFFF; color:#000000">                    Instant                </span>                <span class="mr-1"                    style="padding: 2px; background-color:#999999; border-style:solid; border-width: 3px; border-color:#FFFF00; color:#000000">                    Unknown                </span>            </div>        </div>    </div>`,
        data: function () {
            return {
                autoattack: true,
                small: false,
                smallAA: true,
                hideInterruptedAA: false,
                hideInstantCast: false,
            };
        },
        computed: {
            rotation: function () {
                return logData.players[this.playerindex].details.rotation[this.phaseindex];
            }
        },
        methods: {
            getSkill: function (id) {
                return findSkill(false, id);
            },
            isSwap: function(id) {
                return findSkill(false, id).isSwap;
            },
            showSkill: function (rota) {
                var aa = this.getSkill(rota[1]).aa;
                if (aa) {
                    if (!this.autoattack) {
                        return false;
                    }
                    if (this.hideInterruptedAA && rota[3] === 2) {
                        return false;
                    }
                }
                if (this.hideInstantCast && rota[3] === 4 && !this.isSwap(rota[1])) {
                    return false;
                }
                return true;
            }
        }
    });
}
{
    Vue.component("support-stats-component", {
        props: ["phaseindex", "playerindex"],
        template: `    <div>        <table class="table table-sm table-striped table-hover" cellspacing="0" width="100%" id="sup-table">            <thead>                <tr>                    <th>Sub</th>                    <th></th>                    <th class="text-left">Name</th>                    <th>Account</th>                    <th data-original-title="Condition Cleanse on Others" >                        <img src="https://wiki.guildwars2.com/images/1/12/Healing_Spring.png" alt="Condition Cleanse on Others"                            class="icon icon-hover">                    </th>                    <th data-original-title="Condition Cleanse on Self" >                        <img src="https://wiki.guildwars2.com/images/e/ec/Mending.png" alt="Condition Cleanse on Self"                            class="icon icon-hover">                    </th>                    <th data-original-title="Boon Strips" >                        <img src="https://wiki.guildwars2.com/images/e/ec/Banish_Enchantment.png" alt="Boon Strips"                            class="icon icon-hover">                    </th>                    <th data-original-title="Resurrects" >                        <img src="https://wiki.guildwars2.com/images/3/3d/Downed_ally.png" alt="Resurrects"                            class="icon icon-hover">                    </th>                </tr>            </thead>            <tbody>                <tr v-for="row in tableData.rows" :class="{active: row.player.id === playerindex}">                    <td>{{row.player.group}}</td>                    <td :data-original-title="row.player.profession">                        <img :src="row.player.icon" :alt="row.player.profession" class="icon"><span style="display:none">{{row.player.profession}}</span>                    </td>                    <td class="text-left">{{row.player.name}}</td>                    <td>{{row.player.acc}}</td>                    <td :data-original-title="row.sup[1] + ' seconds'">{{row.sup[0]}}</td>                    <td :data-original-title="row.sup[3] + ' seconds'">{{row.sup[2]}}</td>                    <td :data-original-title="row.sup[5] + ' seconds'">{{row.sup[4]}}</td>                    <td :data-original-title="row.sup[7] + ' seconds'">{{row.sup[6]}}</td>                </tr>            </tbody>            <tfoot>                <tr v-for="sum in tableData.sums">                    <td></td>                    <td></td>                    <td class="text-left">{{sum.name}}</td>                    <td></td>                    <td :data-original-title="round3(sum.sup[1]) + ' seconds'">{{sum.sup[0]}}</td>                    <td :data-original-title="round3(sum.sup[3])  + ' seconds'">{{sum.sup[2]}}</td>                    <td :data-original-title="round3(sum.sup[5])  + ' seconds'">{{sum.sup[4]}}</td>                    <td :data-original-title="round3(sum.sup[7])  + ' seconds'">{{sum.sup[6]}}</td>                </tr>            </tfoot>        </table>    </div>`,
        data: function () {
            return {
                cache: new Map()
            };
        },
        mixins: [roundingComponent],
        mounted() {
            initTable("#sup-table", 4, "desc");
        },
        updated() {
            updateTable("#sup-table");
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            tableData: function () {
                if (this.cache.has(this.phaseindex)) {
                    return this.cache.get(this.phaseindex);
                }
                var rows = [];
                var sums = [];
                var total = [0, 0, 0, 0, 0, 0, 0, 0];
                var groups = [];
                var i;
                for (i = 0; i < this.phase.supportStats.length; i++) {
                    var sup = this.phase.supportStats[i];
                    var player = logData.players[i];
                    if (player.isConjure) {
                        continue;
                    }
                    rows.push({
                        player: player,
                        sup: sup
                    });
                    if (!groups[player.group]) {
                        groups[player.group] = [0, 0, 0, 0, 0, 0, 0, 0];
                    }
                    for (var j = 0; j < sup.length; j++) {
                        total[j] += sup[j];
                        groups[player.group][j] += sup[j];
                    }
                }
                for (i = 0; i < groups.length; i++) {
                    if (groups[i]) {
                        sums.push({
                            name: "Group " + i,
                            sup: groups[i]
                        });
                    }
                }
                sums.push({
                    name: "Total",
                    sup: total
                });
                var res = {
                    rows: rows,
                    sums: sums
                };
                this.cache.set(this.phaseindex, res);
                return res;
            }
        }
    });
}
{
    Vue.component("target-component", {
        props: ["targets", "phaseindex"],
        template: `    <div class="d-flex flex-row justify-content-center flex-wrap">        <div v-for="(target, id) in targets" v-show="show(id)">            <img class="icon-lg mr-2 ml-2 target-cell" :src="getTargetData(id).icon" :alt="getTargetData(id).name"                :data-original-title="getTargetData(id).name" :class="{active: target.active}"                @click="target.active = !target.active">            <target-data-component :targetid="id"></target-data-component>        </div>    </div>`,
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            }
        },
        methods: {
            show: function (index) {
                return this.phase.targets.indexOf(index) !== -1;
            },
            getTargetData: function (id) {
                return logData.targets[id];
            }
        }
    });
}
{
    Vue.component("target-stats-component", {
        props: ["playerindex", "phaseindex", 'light', "simplephase"],
        template: `    <div>        <ul v-if="phaseTargets.length > 1" class=" nav nav-tabs">            <li v-for="target in phaseTargets">                <a class="nav-link" :class="{active: simplephase.focus === target.id}"                    @click="simplephase.focus = target.id">                    {{target.name}}                </a>            </li>        </ul>        <div v-for="target in phaseTargets" v-show="simplephase.focus === target.id">            <div class="d-flex flex-row justify-content-center align-items-center">                <div class="d-flex flex-column justify-content-center align-items-center">                    <img :alt="target.name" class="icon-lg mt-2" :src="target.icon">                    <target-data-component :targetid="target.id"></target-data-component>                </div>                <h3 class="text-center mt-2">{{target.name}}</h3>            </div>        </div>        <ul class="nav nav-tabs">            <li>                <a class="nav-link" :class="{active: mode === 0}" @click="mode = 0">                    Damage                    Distribution                </a>            </li>            <li>                <a class="nav-link" :class="{active: mode === 1}" @click="mode = 1">                    Damage                    Taken                </a>            </li>            <li>                <a class="nav-link" :class="{active: mode === 2}" @click="mode = 2">Graph</a>            </li>            <li>                <a class="nav-link" :class="{active: mode === 3}" @click="mode = 3">Buff Status</a>            </li>        </ul>        <keep-alive>            <target-tab-component v-for="target in targets" :key="target.id" v-if="simplephase.focus === target.id"                :targetindex="target.id" :phaseindex="phaseindex" :playerindex="playerindex" :mode="mode"                :light="light"></target-tab-component>        </keep-alive>    </div>`,
        data: function () {
            return {
                mode: 0
            };
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            targets: function () {
                return logData.targets;
            },
            phaseTargets: function () {
                var res = [];
                for (var i = 0; i < this.phase.targets.length; i++) {
                    var tar = logData.targets[this.phase.targets[i]];
                    res.push(tar);
                }
                if (this.simplephase.focus === -1) {
                    this.simplephase.focus = res[0] ? res[0].id : -1;
                }
                return res;
            }
        }
    });
}
{
    Vue.component("target-tab-component", {
        props: ["phaseindex", "playerindex", 'targetindex', 'mode', 'light'],
        template: `    <div>        <keep-alive>            <dmgdist-target-component v-if="mode === 0" :key="'dist' + targetindex" :phaseindex="phaseindex"                :targetindex="targetindex"></dmgdist-target-component>            <dmgtaken-component v-if="mode === 1" :actor="target" :key="'taken' + targetindex"                :tableid="'dmgtaken-target-'+targetindex" :phaseindex="phaseindex"></dmgtaken-component>            <target-graph-tab-component v-for="(ph, id) in phases" v-if="mode === 2 && id === phaseindex" :key="id"                :targetindex="targetindex" :phaseindex="id" :light="light"></target-graph-tab-component>            <buff-stats-target-component v-if="mode === 3" :key="'buffs' + targetindex" :targetindex="targetindex"                :phaseindex="phaseindex" :playerindex="playerindex"></buff-stats-target-component>        </keep-alive>    </div>`,
        computed: {
            phases: function () {
                return logData.phases;
            },
            target: function () {
                return logData.targets[this.targetindex];
            }
        }
    });
}
{
    Vue.component("dps-graph-component", {
        props: ["activetargets", 'mode', 'phaseindex', 'playerindex', 'light'],
        template: `    <div>              <dps-graph-mode-selector-component :data="graphdata"            :phaseduration="this.phase.end - this.phase.start" :phasehassubphases="!!this.phase.subPhases">        </dps-graph-mode-selector-component>        <h3 class="text-center mt-1 mb-1">{{graphname}}</h3>        <graph-component :id="graphid" :layout="layout" :data="computeData"></graph-component>    </div>`,       
        mixins: [graphComponent],
        data: function () {
            return {
            };
        },
        created: function () {
            // layout - constant during whole lifetime
            var i, j;
            var textColor = this.light ? '#495057' : '#cccccc';
            this.layout = {
                yaxis: {
                    title: 'DPS',
                    fixedrange: false,
                    rangemode: 'tozero',
                    gridcolor: textColor,
                    color: textColor
                },
                xaxis: {
                    title: 'Time(sec)',
                    color: textColor,
                    gridcolor: textColor,
                    xrangeslider: {}
                },
                hovermode: 'x',
                hoverdistance: 150,
                legend: {
                    orientation: 'h',
                    font: {
                        size: 15
                    },
                    y: -0.1
                },
                font: {
                    color: textColor
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                displayModeBar: false,
                shapes: [],
                annotations: [],
                autosize: true,
                width: 1200,
                height: 850,
                datarevision: new Date().getTime(),
            };
            computePhaseMarkups(this.layout.shapes, this.layout.annotations, this.phase, textColor);
            // constant part of data
            // dps
            this.data = [];
            var data = this.data;
            var player;
            for (i = 0; i < logData.players.length; i++) {
                var pText = [];
                player = logData.players[i];
                for (j = 0; j < this.graph.players[i].total.length; j++) {
                    pText.push(player.name);
                }
                data.push({
                    x: this.phase.times,
                    y: [],
                    mode: 'lines',
                    line: {
                        shape: 'spline',
                        color: player.colTarget,
                        width: i === this.playerindex ? 5 : 2
                    },
                    text: pText,
                    hoverinfo: 'y+text+x',
                    name: player.name,
                });
            }
            data.push({
                x: this.phase.times,
                mode: 'lines',
                line: {
                    shape: 'spline'
                },
                hoverinfo: 'name+y+x',
                visible: 'legendonly',
                name: 'All Player'
            });
            // targets health
            computeTargetHealthData(this.graph, logData.targets, this.phase, this.data, null);  
            // targets breakbar          
            computeTargetBreakbarData(this.graph, logData.targets, this.phase, this.data, null);
            // mechanics
            for (i = 0; i < graphData.mechanics.length; i++) {
                var mech = graphData.mechanics[i];
                var mechData = logData.mechanicMap[i];
                var chart = {
                    x: [],
                    mode: 'markers',
                    visible: mech.visible ? null : 'legendonly',
                    type: 'scatter',
                    marker: {
                        symbol: mech.symbol,
                        color: mech.color,
                        size: mech.size ? mech.size : 15
                    },
                    text: [],
                    name: mechData.name,
                    hoverinfo: 'text'
                };
                var time, pts, k;
                if (mechData.enemyMech) {
                    for (j = 0; j < mech.points[this.phaseindex].length; j++) {
                        pts = mech.points[this.phaseindex][j];
                        var tarId = this.phase.targets[j];
                        if (tarId >= 0) {
                            var target = logData.targets[tarId];
                            for (k = 0; k < pts.length; k++) {
                                time = pts[k];
                                chart.x.push(time);
                                chart.text.push(time + 's: ' + target.name);
                            }
                        } else {
                            for (k = 0; k < pts.length; k++) {
                                time = pts[k][0];
                                chart.x.push(time);
                                chart.text.push(time + 's: ' + pts[k][1]);
                            }
                        }
                    }
                } else {
                    for (j = 0; j < mech.points[this.phaseindex].length; j++) {
                        pts = mech.points[this.phaseindex][j];
                        player = logData.players[j];
                        for (k = 0; k < pts.length; k++) {
                            time = pts[k];
                            chart.x.push(time);
                            chart.text.push(time + 's: ' + player.name);
                        }
                    }
                }
                data.push(chart);
            }
        },
        watch: {
            playerindex: {
                handler: function () {
                    for (var i = 0; i < logData.players.length; i++) {
                        this.data[i].line.width = i === this.playerindex ? 5 : 2;
                    }
                    this.layout.datarevision = new Date().getTime();
                },
                deep: true
            },
            light: {
                handler: function () {
                    var textColor = this.light ? '#495057' : '#cccccc';
                    this.layout.yaxis.gridcolor = textColor;
                    this.layout.yaxis.color = textColor;
                    this.layout.xaxis.gridcolor = textColor;
                    this.layout.xaxis.color = textColor;
                    this.layout.font.color = textColor;
                    for (var i = 0; i < this.layout.shapes.length; i++) {
                        this.layout.shapes[i].line.color = textColor;
                    }
                    this.layout.datarevision = new Date().getTime();
                }
            }
        },
        computed: {
            graphid: function () {
                return 'dpsgraph-' + this.phaseindex;
            },
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            graph: function () {
                return graphData.phases[this.phaseindex];
            },
            graphname: function () {
                var name = "Graph";
                switch (this.graphdata.graphmode) {
                    case GraphType.DPS:
                        name = "DPS " + name;
                        break;                   
                    case GraphType.CenteredDPS:
                        name = "Centered DPS " + name;
                        break;
                    case GraphType.Damage:
                        name = "Damage " + name;
                        break;
                    default:
                        break;
                }
                switch (this.graphdata.dpsmode) {
                    case 0:
                        name = "Full " + name;
                        break;
                    case -1:
                        name = "Phase " + name;
                        break;
                    default:                       
                        name = this.graphdata.dpsmode + "s " + name;
                        break;
                }
                name = (this.mode === 0 ? "Total " : (this.mode === 1 ? "Target " : "Cleave ")) + name;
                return name;
            },
            computePhaseBreaks: function () {
                var res = [];
                if (this.phase.subPhases) {
                    for (var i = 0; i < this.phase.subPhases.length; i++) {
                        var subPhase = logData.phases[this.phase.subPhases[i]];
                        res[Math.floor(subPhase.start - this.phase.start)] = true;
                        res[Math.floor(subPhase.end - this.phase.start)] = true;
                    }
                }
                return res;
            },
            computeData: function () {
                this.layout.datarevision = new Date().getTime();
                switch (this.graphdata.graphmode) {
                    case GraphType.DPS:
                        this.layout.yaxis.title = "DPS";
                        break;
                    case GraphType.CenteredDPS:
                        this.layout.yaxis.title = "Centered DPS";
                        break;
                    case GraphType.Damage:
                        this.layout.yaxis.title = "Damage";
                        break;
                    default:
                        break;
                }
                var points = this.computeDPSRelatedData();
                var res = this.data;
                for (var i = 0; i < points.length; i++) {
                    res[i].y = points[i];
                }
                return res;
            }
        },
        methods: {
            computeDPS: function (lim, phasebreaks, cacheID) {
                var maxDPS = {
                    total: 0,
                    cleave: 0,
                    target: 0
                };
                var allDPS = {
                    total: [],
                    cleave: [],
                    target: []
                };
                var playerDPS = [];
                for (var i = 0; i < logData.players.length; i++) {
                    var data = computePlayerDPS(logData.players[i], this.graph.players[i], lim, phasebreaks,
                        this.activetargets, cacheID + '-' + this.phaseindex, this.phase.times, this.graphdata.graphmode);
                    playerDPS.push(data.dps);
                    maxDPS.total = Math.max(maxDPS.total, data.maxDPS.total);
                    maxDPS.cleave = Math.max(maxDPS.cleave, data.maxDPS.cleave);
                    maxDPS.target = Math.max(maxDPS.target, data.maxDPS.target);
                    for (var j = 0; j < data.dps.total.length; j++) {
                        allDPS.total[j] = (allDPS.total[j] || 0) + data.dps.total[j];
                        allDPS.cleave[j] = (allDPS.cleave[j] || 0) + data.dps.cleave[j];
                        allDPS.target[j] = (allDPS.target[j] || 0) + data.dps.target[j];
                    }
                }

                return {
                    allDPS: allDPS,
                    playerDPS: playerDPS,
                    maxDPS: maxDPS,
                };
            },
            computeDPSData: function () {
                var cacheID = this.graphdata.dpsmode + '-' + this.graphdata.graphmode + '-';
                cacheID += getTargetCacheID(this.activetargets);
                if (this.dpsCache.has(cacheID)) {
                    return this.dpsCache.get(cacheID);
                }
                var res;
                if (this.graphdata.dpsmode >= 0) {
                    res = this.computeDPS(this.graphdata.dpsmode, null, cacheID);
                } else {
                    res = this.computeDPS(0, this.computePhaseBreaks, cacheID);
                }
                this.dpsCache.set(cacheID, res);
                return res;
            },
            computeDPSRelatedData: function () {
                var cacheID = this.graphdata.dpsmode + '-' + this.graphdata.graphmode + '-' + this.mode + '-';
                var i, j;
                cacheID += getTargetCacheID(this.activetargets);
                if (this.dataCache.has(cacheID)) {
                    return this.dataCache.get(cacheID);
                }
                var res = [];
                var dpsData = this.computeDPSData();
                var offset = 0;
                for (i = 0; i < logData.players.length; i++) {
                    var pDPS = dpsData.playerDPS[i];
                    res[offset++] = (this.mode === 0 ? pDPS.total : (this.mode === 1 ? pDPS.target : pDPS.cleave));
                }
                res[offset++] = (this.mode === 0 ? dpsData.allDPS.total : (this.mode === 1 ? dpsData.allDPS.target : dpsData.allDPS.cleave));
                var maxDPS = (this.mode === 0 ? dpsData.maxDPS.total : (this.mode === 1 ? dpsData.maxDPS.target : dpsData.maxDPS.cleave));
                var hps = [];
                for (i = 0; i < this.graph.targets.length; i++) {
                    var health = this.graph.targets[i].healthStates;
                    var hpPoints = [];
                    for (j = 0; j < health.length; j++) {
                        hpPoints[j] = health[j][1] * maxDPS / 100.0;
                    }
                    hps[i] = hpPoints;
                    res[offset++] = hpPoints;
                }
                {
                    for (i = 0; i < this.graph.targets.length; i++) {
                        var breakbar = this.graph.targets[i].breakbarPercentStates;
                        if (!breakbar) {
                            continue;
                        }
                        var brPoints = [];
                        for (j = 0; j < breakbar.length; j++) {
                            brPoints[j] = breakbar[j][1] * maxDPS / 100.0;
                        }
                        res[offset++] = brPoints;
                    }
                }
                
                for (i = 0; i < graphData.mechanics.length; i++) {
                    var mech = graphData.mechanics[i];
                    var mechData = logData.mechanicMap[i];
                    var chart = [];
                    res[offset++] = chart;
                    var time, pts, k, ftime, y, yp1;
                    if (mechData.enemyMech) {
                        for (j = 0; j < mech.points[this.phaseindex].length; j++) {
                            pts = mech.points[this.phaseindex][j];
                            var tarId = this.phase.targets[j];
                            if (tarId >= 0) {
                                var health = this.graph.targets[j].healthStates;
                                for (k = 0; k < pts.length; k++) {
                                    chart.push(findState(health, pts[k], 0, health.length - 1) * maxDPS / 100.0);
                                }
                            } else {
                                for (k = 0; k < pts.length; k++) {
                                    chart.push(maxDPS * 0.5);
                                }
                            }
                        }
                    } else {
                        for (j = 0; j < mech.points[this.phaseindex].length; j++) {
                            pts = mech.points[this.phaseindex][j];
                            for (k = 0; k < pts.length; k++) {
                                time = pts[k];
                                ftime = Math.floor(time);
                                y = res[j][ftime];
                                yp1 = res[j][ftime + 1];
                                chart.push(this.interpolatePoint(ftime, ftime + 1, y, yp1, time));
                            }
                        }
                    }
                }
                this.dataCache.set(cacheID, res);
                return res;
            },
            interpolatePoint: function (x1, x2, y1, y2, x) {
                if (typeof y2 !== "undefined") {
                    return y1 + (y2 - y1) / (x2 - x1) * (x - x1);
                } else {
                    return y1;
                }
            }
        }
    });
}
{
    Vue.component("dps-graph-mode-selector-component", {
        props: ['data', 'phaseduration', 'phasehassubphases'],
        template: `    <div class="d-flex flex-row justify-content-center mt-1 mb-1">        <ul class="nav nav-pills d-flex flex-row justify-content-center mr-3 scale85">            <li class="nav-item">                <a class="nav-link" @click="data.dpsmode = 0" :class="{active: data.dpsmode === 0}">Full</a>            </li>                        <li v-if="phaseduration > 4" class="nav-item">                <a class="nav-link" @click="data.dpsmode = 4" :class="{active: data.dpsmode === 4}">4s</a>            </li>            <li v-if="phaseduration > 10" class="nav-item">                <a class="nav-link" @click="data.dpsmode = 10" :class="{active: data.dpsmode === 10}">10s</a>            </li>                <li v-if="phaseduration > 20" class="nav-item">                <a class="nav-link" @click="data.dpsmode = 20" :class="{active: data.dpsmode === 20}">20s</a>            </li>            <li v-if="phaseduration > 30" class="nav-item">                <a class="nav-link" @click="data.dpsmode = 30" :class="{active: data.dpsmode === 30}">30s</a>            </li>            <li v-if="phasehassubphases" class="nav-item">                <a class="nav-link" @click="data.dpsmode = -1" :class="{active: data.dpsmode === -1}">Phase</a>            </li>        </ul>        <ul class="nav nav-pills d-flex flex-row justify-content-center ml-3 scale85">            <li class="nav-item">                <a class="nav-link" @click="data.graphmode = graphModeEnum.DPS" :class="{active: data.graphmode === graphModeEnum.DPS}">DPS</a>            </li>                <li class="nav-item">                <a class="nav-link" @click="data.graphmode = graphModeEnum.CenteredDPS" :class="{active: data.graphmode === graphModeEnum.CenteredDPS}">Centered DPS</a>            </li>                                 <li class="nav-item">                <a class="nav-link" @click="data.graphmode = graphModeEnum.Damage" :class="{active: data.graphmode === graphModeEnum.Damage}">Damage</a>            </li>        </ul>    </div>`,
        computed: {
            graphModeEnum: function() {
                return GraphType;
            }
        }
    });
}
{
    Vue.component("graph-stats-component", {
        props: ["activetargets", "phaseindex", 'playerindex', 'light'],
        template: `    <div>        <div v-if="!targetless">            <ul class="nav nav-tabs">                <li>                    <a class="nav-link" :class="{active: mode === 0}" @click="mode = 0">Total</a>                </li>                <li>                    <a class="nav-link" :class="{active: mode === 1}" @click="mode = 1">Target</a>                </li>                <li>                    <a class="nav-link" :class="{active: mode === 2}" @click="mode = 2">Cleave</a>                </li>            </ul>        </div>        <keep-alive>            <dps-graph-component v-for="(phase, id) in phases" :key="id" v-if="id === phaseindex"                :activetargets="activetargets" :mode="mode" :phaseindex="id" :playerindex="playerindex" :light="light">            </dps-graph-component>        </keep-alive>    </div>`,
        data: function () {
            return {
                targetless: logData.targetless,
                mode: logData.targetless ? 0 : 1,
            };
        },
        computed: {
            phases: function() {
                return logData.phases;
            }
        }
    });
}
{
    Vue.component("player-graph-tab-component", {
        props: ["playerindex", "phaseindex", "activetargets", "light"],
        template: `    <div>             <dps-graph-mode-selector-component :data="graphdata"            :phaseduration="this.phase.end - this.phase.start" :phasehassubphases="!!this.phase.subPhases">        </dps-graph-mode-selector-component>        <h3 class="text-center mt-1 mb-1">{{graphname}}</h3>        <graph-component :id="graphid" :layout="layout" :data="computeData"></graph-component>        <rotation-legend-component></rotation-legend-component>    </div>`,  
        mixins: [graphComponent],
        data: function () {
            return {
                playerOffset: 0,
                graphOffset: 0
            };
        },
        watch: {
            light: {
                handler: function () {
                    var textColor = this.light ? '#495057' : '#cccccc';
                    this.layout.yaxis.gridcolor = textColor;
                    this.layout.yaxis.color = textColor;
                    this.layout.yaxis2.gridcolor = textColor;
                    this.layout.yaxis2.color = textColor;
                    this.layout.yaxis3.gridcolor = textColor;
                    this.layout.yaxis3.color = textColor;
                    this.layout.xaxis.gridcolor = textColor;
                    this.layout.xaxis.color = textColor;
                    this.layout.font.color = textColor;
                    for (var i = 0; i < this.layout.shapes.length; i++) {
                        this.layout.shapes[i].line.color = textColor;
                    }
                    this.layout.datarevision = new Date().getTime();
                }
            }
        },
        created: function () {
            var images = [];
            this.data = [];
            this.playerOffset += computeRotationData(this.player.details.rotation[this.phaseindex], images, this.data, this.phase);
            var oldOffset = this.playerOffset;
            this.playerOffset += computeBuffData(this.player.details.boonGraph[this.phaseindex], this.data);
            var dpsY = oldOffset === this.playerOffset ? 'y2' : 'y3';
            this.graphOffset = this.playerOffset;
            this.playerOffset += computeTargetBreakbarData(this.graph, logData.targets, this.phase, this.data, dpsY);
            this.playerOffset += computeTargetHealthData(this.graph, logData.targets, this.phase, this.data, dpsY);
            if (this.healthGraph) {
                this.playerOffset += computePlayerHealthData(this.healthGraph, this.data, dpsY);
            }
            this.data.push({
                x: this.phase.times,
                y: [],
                mode: 'lines',
                line: {
                    shape: 'spline',
                    color: this.player.colTotal,
                },
                yaxis: dpsY,
                hoverinfo: 'name+y+x',
                name: 'Total'
            });
            if (!logData.targetless) {
                this.data.push({
                    x: this.phase.times,
                    y: [],
                    mode: 'lines',
                    line: {
                        shape: 'spline',
                        color: this.player.colTarget,
                    },
                    yaxis: dpsY,
                    hoverinfo: 'name+y+x',
                    name: 'Target'
                });
                this.data.push({
                    x: this.phase.times,
                    y: [],
                    mode: 'lines',
                    line: {
                        shape: 'spline',
                        color: this.player.colCleave,
                    },
                    yaxis: dpsY,
                    hoverinfo: 'name+y+x',
                    name: 'Cleave'
                });
            }
            this.layout = getActorGraphLayout(images, this.light ? '#495057' : '#cccccc');
            computePhaseMarkups(this.layout.shapes, this.layout.annotations, this.phase, this.light ? '#495057' : '#cccccc');
        },
        computed: {
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            player: function () {
                return logData.players[this.playerindex];
            },
            graph: function () {
                return graphData.phases[this.phaseindex];
            },
            healthGraph: function () {
                return this.graph.players[this.playerindex].healthStates;
            },
            graphid: function () {
                return "playergraph-" + this.playerindex + '-' + this.phaseindex;
            },
            graphname: function () {
                var name = "Graph";
                switch (this.graphdata.graphmode) {
                    case GraphType.DPS:
                        name = "DPS " + name;
                        break;
                    case GraphType.CenteredDPS:
                        name = "Centered DPS " + name;
                        break;
                    case GraphType.Damage:
                        name = "Damage " + name;
                        break;
                    default:
                        break;
                }
                switch (this.graphdata.dpsmode) {
                    case 0:
                        name = "Full " + name;
                        break;
                    case -1:
                        name = "Phase " + name;
                        break;
                    default:                       
                        name = this.graphdata.dpsmode + "s " + name;
                        break;
                }
                return name;
            },
            computePhaseBreaks: function () {
                var res = [];
                if (this.phase.subPhases) {
                    for (var i = 0; i < this.phase.subPhases.length; i++) {
                        var subPhase = logData.phases[this.phase.subPhases[i]];
                        res[Math.floor(subPhase.start - this.phase.start)] = true;
                        res[Math.floor(subPhase.end - this.phase.start)] = true;
                    }
                }
                return res;
            },
            computeData: function () {
                this.layout.datarevision = new Date().getTime();
                switch (this.graphdata.graphmode) {
                    case GraphType.DPS:
                        this.layout.yaxis3.title = "DPS";
                        break;
                    case GraphType.CenteredDPS:
                        this.layout.yaxis3.title = "Centered DPS";
                        break;
                    case GraphType.Damage:
                        this.layout.yaxis3.title = "Damage";
                        break;
                    default:
                        break;
                }
                var res = this.data;
                var data = this.computeDPSRelatedData();
                this.data[this.playerOffset].y = data[0];
                if (!logData.targetless) {
                    this.data[this.playerOffset + 1].y = data[1];
                    this.data[this.playerOffset + 2].y = data[2];
                }
                var offset = 3;
                for (var i = this.graphOffset; i < this.playerOffset; i++) {
                    this.data[i].y = data[offset++];
                }
                return res;
            }
        },
        methods: {
            computeDPSData: function () {
                var cacheID = this.graphdata.dpsmode + '-' + this.graphdata.graphmode + '-';
                cacheID += getTargetCacheID(this.activetargets);
                if (this.dpsCache.has(cacheID)) {
                    return this.dpsCache.get(cacheID);
                }
                var data;
                var graphData = this.graph.players[this.playerindex];
                if (this.graphdata.dpsmode >= 0) {
                    data = computePlayerDPS(this.player, graphData, this.graphdata.dpsmode, null, this.activetargets, cacheID + '-' + this.phaseindex, this.phase.times, this.graphdata.graphmode);
                } else {
                    data = computePlayerDPS(this.player, graphData, 0, this.computePhaseBreaks, this.activetargets, cacheID + '-' + this.phaseindex, this.phase.times, this.graphdata.graphmode);
                }
                var res = {
                    maxDPS: data.maxDPS.total,
                    playerDPS: data.dps
                };
                this.dpsCache.set(cacheID, res);
                return res;
            },
            computeDPSRelatedData: function () {
                var cacheID = this.graphdata.dpsmode + '-' + this.graphdata.graphmode + '-';
                cacheID += getTargetCacheID(this.activetargets);
                if (this.dataCache.has(cacheID)) {
                    return this.dataCache.get(cacheID);
                }
                var offset = 0;
                var dpsData = this.computeDPSData();
                var res = [];
                res[offset++] = dpsData.playerDPS.total;
                res[offset++] = dpsData.playerDPS.target;
                res[offset++] = dpsData.playerDPS.cleave;
                for (var i = 0; i < this.graph.targets.length; i++) {
                    var breakbar = this.graph.targets[i].breakbarPercentStates;
                    if (!breakbar) {
                        continue;
                    }
                    var brPoints = [];
                    for (var j = 0; j < breakbar.length; j++) {
                        brPoints[j] = breakbar[j][1] * dpsData.maxDPS / 100.0;
                    }
                    res[offset++] = brPoints;
                }
                for (var i = 0; i < this.graph.targets.length; i++) {
                    var health = this.graph.targets[i].healthStates;
                    var hpPoints = [];
                    for (var j = 0; j < health.length; j++) {
                        hpPoints[j] = health[j][1] * dpsData.maxDPS / 100.0;
                    }
                    res[offset++] = hpPoints;
                }
                if (this.healthGraph) {
                    var health = this.healthGraph;
                    var hpPoints = [];
                    for (var j = 0; j < health.length; j++) {
                        hpPoints[j] = health[j][1] * dpsData.maxDPS / 100.0;
                    }
                    res[offset++] = hpPoints;
                }
                this.dataCache.set(cacheID, res);
                return res;
            },
        }
    });
}
{
    Vue.component('rotation-legend-component', {
        template: `    <div class="card">        <div class="card-body container">            <p><u>Fill</u></p>            <span style="padding: 2px; background-color:#0000FF; border-style:solid; border-width: 1px; border-color:#000000; color:#FFFFFF">                Hit                without aftercast            </span>            <span style="padding: 2px; background-color:#00FF00; border-style:solid; border-width: 1px; border-color:#000000; color:#000000">                Hit                with full aftercast            </span>            <span style="padding: 2px; background-color:#FF0000; border-style:solid; border-width: 1px; border-color:#000000; color:#FFFFFF">                Attack                canceled before completing            </span>            <span style="padding: 2px; background-color:#00FFFF; border-style:solid; border-width: 1px; border-color:#000000; color:#000000" data-original-title="50 ms on graph so that it appears">                Instant cast            </span>            <span style="padding: 2px; background-color:#FFFF00; border-style:solid; border-width: 1px; border-color:#000000; color:#000000">                Unknown                state            </span>            <p class="mt-2"><u>Outline</u></p>            <div>                The outline will be a linear gradient between slowed animation and normal animation when slowed, animation with quickness and normal animation when accelerated.            </div>            <span style="padding: 2px; background-color:#999999; border-style:solid; border-width: 2px; border-color:rgb(220,125,30); color:#000000">                Slowed                animation length            </span>            <span style="padding: 2px; background-color:#999999; border-style:solid; border-width: 2px; border-color:rgb(125,125,125); color:#000000">                Normal                animation length            </span>            <span style="padding: 2px; background-color:#999999; border-style:solid; border-width: 2px; border-color:rgb(220,20,220); color:#000000">                Animation                with quickness            </span>        </div>    </div>`
    });
}
{

    function computeTargetDPS(target, damageData, lim, phasebreaks, cacheID, times, graphMode) {
        if (target.dpsGraphCache.has(cacheID)) {
            return target.dpsGraphCache.get(cacheID);
        }
        var totalDamage = 0;
        var totalDPS = [0];
        var maxDPS = 0;
        var left = 0, right = 0;
        var end = times.length;
        if (graphMode === GraphType.CenteredDPS) {
            lim /= 2;
        }
        for (var j = 0; j < end; j++) {
            var time = times[j];
            if (lim > 0) {
                left = Math.max(Math.round(time - lim), 0);
            } else if (phasebreaks && phasebreaks[j]) {
                left = j;
            }
            right = j;    
            if (graphMode === GraphType.CenteredDPS) {
                if (lim > 0) {
                    right = Math.min(Math.round(time + lim), end - 1);
                } else if (phasebreaks) {
                    for (var i = left + 1; i < phasebreaks.length; i++) {
                        if (phasebreaks[i]) {
                            right = i;
                            break;
                        }
                    }
                } else {
                    right = end - 1;
                }
            }  
            var div = graphMode !== GraphType.Damage ? Math.max(times[right] - times[left], 1) : 1;
            totalDamage = damageData[right] - damageData[left];
            totalDPS[j] = Math.round(totalDamage / (div));
            maxDPS = Math.max(maxDPS, totalDPS[j]);
        }
        if (maxDPS < 1e-6) {
            maxDPS = 10;
        }
        var res = {
            dps: totalDPS,
            maxDPS: maxDPS
        };
        target.dpsGraphCache.set(cacheID, res);
        return res;
    }

    Vue.component("target-graph-tab-component", {
        props: ["targetindex", "phaseindex", 'light'],
        template: `    <div>             <dps-graph-mode-selector-component :data="graphdata"             :phaseduration="this.phase.end - this.phase.start" :phasehassubphases="!!this.phase.subPhases">        </dps-graph-mode-selector-component>        <h3 class="text-center mt-1 mb-1">{{graphname}}</h3>        <graph-component :id="graphid" :layout="layout" :data="computeData"></graph-component>        <rotation-legend-component></rotation-legend-component>    </div>`,   
        mixins: [graphComponent],
        data: function () {
            return {
                targetOffset: 0
            };
        },
        watch: {
            light: {
                handler: function () {
                    var textColor = this.light ? '#495057' : '#cccccc';
                    this.layout.yaxis.gridcolor = textColor;
                    this.layout.yaxis.color = textColor;
                    this.layout.yaxis2.gridcolor = textColor;
                    this.layout.yaxis2.color = textColor;
                    this.layout.yaxis3.gridcolor = textColor;
                    this.layout.yaxis3.color = textColor;
                    this.layout.xaxis.gridcolor = textColor;
                    this.layout.xaxis.color = textColor;
                    this.layout.font.color = textColor;
                    for (var i = 0; i < this.layout.shapes.length; i++) {
                        this.layout.shapes[i].line.color = textColor;
                    }
                    this.layout.datarevision = new Date().getTime();
                }
            }
        },
        created: function () {
            var images = [];
            this.data = [];
            this.targetOffset += computeRotationData(this.target.details.rotation[this.phaseindex], images, this.data, this.phase);
            var oldOffset = this.targetOffset;
            this.targetOffset += computeBuffData(this.target.details.boonGraph[this.phaseindex], this.data);
            var dpsY = oldOffset === this.targetOffset ? 'y2' : 'y3';
            if (this.hasBreakbarStates) {
                var breakbarStates = this.graph.targets[this.phaseTargetIndex].breakbarPercentStates;
                var breakbarTexts = [];
                var times = [];
                for (var j = 0; j < breakbarStates.length; j++) {
                    breakbarTexts[j] = breakbarStates[j][1] + "% breakbar";
                    times[j] = breakbarStates[j][0];
                }
                var res = {
                    x: times,
                    text: breakbarTexts,
                    mode: 'lines',
                    line: {
                        dash: 'dashdot',
                        shape: 'hv'
                    },
                    hoverinfo: 'text',
                    visible: this.phase.breakbarPhase ? true : 'legendonly',
                    name: this.target.name + ' breakbar',
                    yaxis: dpsY
                };
                this.data.push(res);
                this.targetOffset++;
            }
            {
                var health = this.graph.targets[this.phaseTargetIndex].healthStates;
                var hpTexts = [];
                var times = [];
                for (var j = 0; j < health.length; j++) {
                    hpTexts[j] = health[j][1] + "% hp";
                    times[j] = health[j][0];
                }
                var res = {
                    x: times,
                    text: hpTexts,
                    mode: 'lines',
                    line: {
                        dash: 'dashdot',
                        shape: 'hv'
                    },
                    hoverinfo: 'text',
                    name: this.target.name + ' health',
                    yaxis: dpsY
                };
                this.data.push(res);
                this.targetOffset++;
            }
            this.data.push({
                x: this.phase.times,
                y: [],
                mode: 'lines',
                line: {
                    shape: 'spline'
                },
                yaxis: dpsY,
                hoverinfo: 'name+y+x',
                name: 'Total'
            });
            this.layout = getActorGraphLayout(images, this.light ? '#495057' : '#cccccc');
            computePhaseMarkups(this.layout.shapes, this.layout.annotations, this.phase, this.light ? '#495057' : '#cccccc');
        },
        computed: {
            hasBreakbarStates: function() {
                return !!this.graph.targets[this.phaseTargetIndex].breakbarPercentStates;
            },
            target: function () {
                return logData.targets[this.targetindex];
            },
            phase: function () {
                return logData.phases[this.phaseindex];
            },
            graph: function () {
                return graphData.phases[this.phaseindex];
            },
            phaseTargetIndex: function () {
                return this.phase.targets.indexOf(this.targetindex);
            },
            graphid: function () {
                return "targetgraph-" + this.phaseTargetIndex + '-' + this.phaseindex;
            },
            graphname: function () {
                var name = "Graph";
                switch (this.graphdata.graphmode) {
                    case GraphType.DPS:
                        name = "DPS " + name;
                        break;
                    case GraphType.CenteredDPS:
                        name = "Centered DPS " + name;
                        break;
                    case GraphType.Damage:
                        name = "Damage " + name;
                        break;
                    default:
                        break;
                }
                switch (this.graphdata.dpsmode) {
                    case 0:
                        name = "Full " + name;
                        break;
                    case -1:
                        name = "Phase " + name;
                        break;
                    default:                       
                        name = this.graphdata.dpsmode + "s " + name;
                        break;
                }
                return name;
            },
            computePhaseBreaks: function () {
                var res = [];
                if (this.phase.subPhases) {
                    for (var i = 0; i < this.phase.subPhases.length; i++) {
                        var subPhase = logData.phases[this.phase.subPhases[i]];
                        res[Math.floor(subPhase.start - this.phase.start)] = true;
                        res[Math.floor(subPhase.end - this.phase.start)] = true;
                    }
                }
                return res;
            },
            computeData: function () {
                this.layout.datarevision = new Date().getTime();
                switch (this.graphdata.graphmode) {
                    case GraphType.DPS:
                        this.layout.yaxis3.title = "DPS";
                        break;
                    case GraphType.CenteredDPS:
                        this.layout.yaxis3.title = "Centered DPS";
                        break;
                    case GraphType.Damage:
                        this.layout.yaxis3.title = "Damage";
                        break;
                    default:
                        break;
                }
                var res = this.data;
                var data = this.computeDPSRelatedData();
                this.data[this.targetOffset].y = data[0];
                this.data[this.targetOffset - 1].y = data[1];
                if (data[2]) {
                    this.data[this.targetOffset - 2].y = data[2];
                }
                return res;
            }
        },
        methods: {
            computeDPSData: function () {
                var cacheID = this.graphdata.dpsmode + '-' + this.graphdata.graphmode;
                if (this.dpsCache.has(cacheID)) {
                    return this.dpsCache.get(cacheID);
                }
                //var before = performance.now();
                var res;
                var damageData = this.graph.targets[this.phaseTargetIndex].total;
                if (this.graphdata.dpsmode >= 0) {
                    res = computeTargetDPS(this.target, damageData, this.graphdata.dpsmode, null, cacheID + '-' + this.phaseindex, this.phase.times, this.graphdata.graphmode);
                } else {
                    res = computeTargetDPS(this.target, damageData, 0, this.computePhaseBreaks, cacheID + '-' + this.phaseindex, this.phase.times, this.graphdata.graphmode);
                }
                this.dpsCache.set(cacheID, res);
                return res;
            },
            computeDPSRelatedData: function () {
                var cacheID = this.graphdata.dpsmode + '-' + this.graphdata.graphmode;
                if (this.dataCache.has(cacheID)) {
                    return this.dataCache.get(cacheID);
                }
                var dpsData = this.computeDPSData();
                var res = [];
                res[0] = dpsData.dps;
                {
                    var health = this.graph.targets[this.phaseTargetIndex].healthStates;
                    var hpPoints = [];
                    for (var j = 0; j < health.length; j++) {
                        hpPoints[j] = health[j][1] * dpsData.maxDPS / 100.0;
                    }
                    res[1] = hpPoints;
                }
                if (this.hasBreakbarStates) {
                    var breakbarStates = this.graph.targets[this.phaseTargetIndex].breakbarPercentStates;
                    var breakbarPoints = [];
                    for (var j = 0; j < breakbarStates.length; j++) {
                        breakbarPoints[j] = breakbarStates[j][1] * dpsData.maxDPS / 100.0;
                    }
                    res[2] = breakbarPoints;
                }
                this.dataCache.set(cacheID, res);
                return res;
            },
        }
    });
}
{
    Vue.component('target-data-component', {
        props: ['targetid'],
        template: `    <div class="d-flex flex-row justify-content-center align-items-center mb-2">        <img v-if="target.health > 0" src="https://wiki.guildwars2.com/images/b/be/Vitality.png" alt="Health"            class="icon" :data-original-title="'Health: ' + target.health">        <img v-if="target.tough > 0" src="https://wiki.guildwars2.com/images/1/12/Toughness.png" alt="Toughness"            class="icon" hbHeight :data-original-title="'Toughness: ' + target.tough">        <img v-if="target.hbWidth > 0" src="https://wiki.guildwars2.com/images/e/e7/1863930.png" alt="Hitbox Width"            class="icon" :data-original-title="'Hitbox Width: ' + target.hbWidth">        <img v-if="target.hbHeight > 0" src="https://wiki.guildwars2.com/images/5/57/1863934.png" alt="Hitbox Height"            class="icon" :data-original-title="'Hitbox Height: ' + target.hbHeight">    </div>`,
        computed: {
            target: function () {
                return logData.targets[this.targetid];
            }
        }
    });
}
{
    Vue.component("main-view-component", {
        props: ['light'],
        template: `    <div>        <div class="d-flex flex-row justify-content-center mt-1" id="phase-nav">            <phase-component :phases="logdata.phases"></phase-component>        </div>        <div class="d-flex flex-row justify-content-center mb-2 mt-2" id="actors">            <div v-show="tab !== 5" :class="{'d-flex': tab !== 5}"                class="flex-row justify-content-center align-items-center flex-wrap mr-5">                <target-component :targets="logdata.targets" :phaseindex="activePhase"></target-component>            </div>            <div class="ml-5">                <player-component :players="logdata.players" :playerindex="activePlayer"></player-component>            </div>        </div>             <h2 class="text-center">{{ name }}</h2>        <ul class="nav nav-tabs">            <li>                <a class="nav-link" :class="{active: tab === 0}" @click="tab = 0">General Stats</a>            </li>            <li>                <a class="nav-link" :class="{active: tab === 1}" @click="tab = 1">Buffs</a>            </li>            <li v-if="hasDamageMods">                <a class="nav-link" :class="{active: tab === 2}" @click="tab = 2">Damage Modifiers</a>            </li>            <li v-if="hasMechanics">                <a class="nav-link" :class="{active: tab === 3}" @click="tab = 3">Mechanics</a>            </li>            <li>                <a class="nav-link" :class="{active: tab === 4}" @click="tab = 4">Graph</a>            </li>            <li v-if="hasTargets">                <a class="nav-link" :class="{active: tab === 5}" @click="tab = 5">Targets Summary</a>            </li>            <li>                <a class="nav-link" :class="{active: tab === 6}" @click="tab = 6">Player Summary</a>            </li>        </ul>        <keep-alive>            <stat-tables-component v-if="tab === 0" :key="'stat-tables'"                :phaseindex="activePhase" :playerindex="activePlayer" :activetargets="activePhaseTargets"></stat-tables-component>            <buff-tables-component v-if="tab === 1" :key="'buff-tables'"                :phaseindex="activePhase" :playerindex="activePlayer"></buff-tables-component>            <dmgmodifier-stats-component v-if="tab === 2" :key="'modifier'"                :phaseindex="activePhase" :playerindex="activePlayer" :activetargets="activePhaseTargets">            </dmgmodifier-stats-component>            <mechanics-stats-component v-if="tab === 3" :key="'mechanics'"                :phaseindex="activePhase" :playerindex="activePlayer"></mechanics-stats-component>            <graph-stats-component v-if="tab === 4" :key="'graph'"                :activetargets="activePhaseTargets" :phaseindex="activePhase" :playerindex="activePlayer"                :light="light"></graph-stats-component>            </personal-buff-table-component>            <target-stats-component v-if="tab === 5" :key="'targets'" :playerindex="activePlayer"                :simplephase="logdata.phases[activePhase]" :phaseindex="activePhase" :light="light">            </target-stats-component>            <player-stats-component v-if="tab === 6" :key="'players'"                :activeplayer="activePlayer" :phaseindex="activePhase" :activetargets="activePhaseTargets"                :light="light"></player-stats-component>        </keep-alive>    </div>`,
        data: function () {
            return {
                tab: 0,
                logdata: simpleLogData
            };
        },
        computed: {
            activePhase: function () {
                var phases = this.logdata.phases;
                for (var i = 0; i < phases.length; i++) {
                    if (phases[i].active) {
                        return i;
                    }
                }
            },
            phase: function () {
                return logData.phases[this.activePhase];
            },
            activePlayer: function () {
                var players = this.logdata.players;
                for (var i = 0; i < players.length; i++) {
                    if (players[i].active) {
                        return i;
                    }
                }
                return -1;
            },
            name: function () {
                return this.phase.name + " Summary";
            },
            activePhaseTargets: function () {
                var res = [];
                var activePhase = logData.phases[this.activePhase];
                for (var i = 0; i < activePhase.targets.length; i++) {
                    var target = this.logdata.targets[activePhase.targets[i]];
                    if (target.active) {
                        res.push(i);
                    }
                }
                return res;
            },
            hasDamageMods: function() {
                return !logData.targetless;
            },
            hasMechanics: function() {
                return logData.mechanicMap.length > 0 && !logData.noMechanics;
            },
            hasTargets: function() {
                return !logData.targetless && !logData.wvw;
            }
        }
    });
}
{
    Vue.component("combat-replay-damage-data-component", {
        template: `    <div class="d-flex flex-column justify-content-center">        <combat-replay-damage-stats-component :time="time" :playerindex="playerindex">        </combat-replay-damage-stats-component>    </div>`,
        props: ["time", "selectedplayer", "selectedplayerid"],
        computed: {
            playerindex: function () {
                if (this.selectedplayer) {
                    for (var i = 0; i < logData.players.length; i++) {
                        if (logData.players[i].uniqueID == this.selectedplayerid) {
                            return i;
                        }
                    }
                }
                return -1;
            }
        }
    });
}
{
    Vue.component("combat-replay-status-data-component", {
        template: `    <div class="d-flex flex-column justify-content-center">        <ul class="nav nav-pills d-flex flex-row justify-content-center mb-1">            <li class="nav-item">                <a class="nav-link" :class="{active: mode === 0}" @click="mode = 0">Players</a>            </li>            <li v-if="!targetless" class="nav-item">                <a class="nav-link" :class="{active: mode === 1}" @click="mode = 1">Targets</a>            </li>            <li class="nav-item">                <a class="nav-link" :class="{active: mode === 2}" @click="mode = 2">Mechanics</a>            </li>        </ul>        <div class="squad-details">            <keep-alive>                <combat-replay-players-stats-component v-if="mode === 0" :key="'players-cr-details'" :time="time" :selectedplayer="selectedplayer" :selectedplayerid="selectedplayerid"></combat-replay-players-stats-component>                <combat-replay-targets-stats-component v-if="mode === 1" :key="'targets-cr-details'" :time="time"></combat-replay-targets-stats-component>                <combat-replay-mechanics-list-component v-if="mode === 2" :key="'mechanics-cr-details'" :selectedplayerid="selectedplayerid"></combat-replay-mechanics-list-component>            </keep-alive>        </div>    </div>`,
        props: ["time", "selectedplayer", "selectedplayerid"],
        data: function() {
            return {
                targetless: logData.targetless,
                mode: 0
            };
        }
    });
}
{
    Vue.component("combat-replay-damage-stats-component", {
        mixins: [timeRefreshComponent],
        props: ["playerindex"],
        template: `    <div>        <ul class="nav nav-pills d-flex flex-row justify-content-center">            <li class="nav-item">                <a class="nav-link" @click="damageMode = 0" :class="{active: damageMode === 0}">Damage</a>            </li>            <li class="nav-item">                <a class="nav-link" @click="damageMode = 1" :class="{active: damageMode === 1}">DPS</a>            </li>        </ul>        <div class="scrollable-cr-dps-table">            <table class="table table-sm table-striped table-hover"  cellspacing="0" width="100%" id="combat-replay-dps-table">                <thead>                    <tr>                        <th class="cr-dps-table-icon-col"></th>                        <th class="text-left cr-dps-table-name">                            Name                        </th>                        <th class="cr-dps-table-dps">                            All                        </th>                        <th class="cr-dps-table-dps" v-if="!targetless" v-for="col in tableData.cols">                            <span :title="col.name">                                {{col.name}}                            </span>                        </th>                    </tr>                </thead>                <tbody class="scrollable-y" style="max-height: 331px !important;">                    <tr v-for="row in tableData.rows" :class="{active: row.player.id === playerindex}">                        <td class="cr-dps-table-icon-col" :data-original-title="row.player.profession">                            <img :src="row.player.icon" :alt="row.player.profession" class="icon">                            <span style="display:none">                                {{row.player.profession}}                            </span>                        </td>                        <td class="text-left cr-dps-table-name">                            <span :title="row.player.name">                                {{row.player.name}}                            </span>                        </td>                        <td class="cr-dps-table-dps">                            {{Math.round(row.dps[2*tableData.cols.length+(damageMode === 1 ? 1 : 0)])}}                        </td>                        <td class="cr-dps-table-dps" v-if="!targetless" v-for="(col, id) in tableData.cols">                            {{Math.round(row.dps[2*id +(damageMode === 1 ? 1 : 0)])}}                        </td>                    </tr>                </tbody>                <tfoot>                    <tr v-for="sum in tableData.sums">                        <td class="cr-dps-table-icon-col"></td>                        <td class="text-left cr-dps-table-name">                            {{sum.name}}                        </td>                        <td class="cr-dps-table-dps">                            {{Math.round(sum.dps[2*tableData.cols.length+(damageMode === 1 ? 1 : 0)])}}                        </td>                        <td class="cr-dps-table-dps" v-if="!targetless" v-for="(col, id) in tableData.cols">                            {{Math.round(sum.dps[2*id +(damageMode === 1 ? 1 : 0)])}}                        </td>                    </tr>                </tfoot>            </table>        </div>         </div>    `,
        data: function () {
            return {
                targetless: logData.targetless,
                damageMode: 1
            };
        },
        created() {
            var i, cacheID;
            for (var j = 0; j < this.targets.length; j++) {
                var activeTargets = [j];
                cacheID = 0 + '-';
                cacheID += getTargetCacheID(activeTargets);
                // compute dps for all players
                for (i = 0; i < logData.players.length; i++) {
                    computePlayerDPS(logData.players[i], this.graph[i], 0, null, activeTargets, cacheID + '-' + 0, this.phase.times, GraphType.DPS);
                }
            }
            cacheID = 0 + '-';
            cacheID += getTargetCacheID(this.targets);
            // compute dps for all players
            for (i = 0; i < logData.players.length; i++) {
                computePlayerDPS(logData.players[i], this.graph[i], 0, null, this.targets, cacheID + '-' + 0, this.phase.times, GraphType.DPS);
            }
        },
        mounted() {
            var pageScrollPos;
            initTable("#combat-replay-dps-table", 2, "desc", null);
        },
        updated() {
            updateTable("#combat-replay-dps-table");
        },
        computed: {
            phase: function () {
                return logData.phases[0];
            },
            targets: function () {
                return this.phase.targets;
            },
            graph: function () {
                return graphData.phases[0].players;
            },
            tableData: function () {
                var rows = [];
                var cols = [];
                var sums = [];
                var total = [];
                var tS = this.timeToUse / 1000.0;
                var curTime = Math.floor(tS);
                var nextTime = curTime + 1;
                var dur = Math.floor(this.phase.end - this.phase.start);
                if (nextTime == dur + 1 && this.phase.needsLastPoint) {
                    nextTime = this.phase.end - this.phase.start;
                }
                var i, j;
                for (j = 0; j < this.targets.length; j++) {
                    var target = logData.targets[this.targets[j]];
                    cols.push(target);
                }
                for (i = 0; i < this.graph.length; i++) {
                    var cacheID, data, cur, next;
                    var player = logData.players[i];
                    var graphData = this.graph[i];
                    var dps = [];
                    // targets
                    for (j = 0; j < this.targets.length; j++) {
                        var activeTargets = [j];
                        cacheID = 0 + '-';
                        cacheID += getTargetCacheID(activeTargets);
                        data = computePlayerDPS(player, graphData, 0, null, activeTargets, cacheID + '-' + 0, this.phase.times, GraphType.DPS).total.target;
                        cur = data[curTime];
                        next = data[curTime + 1];
                        if (typeof next !== "undefined") {
                            dps[2 * j] = cur + (tS - curTime) * (next - cur)/(nextTime - curTime);
                        } else {
                            dps[2 * j] = cur;
                        }
                        dps[2 * j + 1] = dps[2 * j] / (Math.max(tS, 1));
                    }
                    cacheID = 0 + '-';
                    cacheID += getTargetCacheID(this.targets);
                    data = computePlayerDPS(player, graphData, 0, null, this.targets, cacheID + '-' + 0, this.phase.times, GraphType.DPS).total.total;
                    cur = data[curTime];
                    next = data[curTime + 1];
                    if (typeof next !== "undefined") {
                        dps[2 * j] = cur + (tS - curTime) * (next - cur)/(nextTime - curTime);
                    } else {
                        dps[2 * j] = cur;
                    }
                    dps[2 * j + 1] = dps[2 * j] / (Math.max(tS, 1));
                    for (j = 0; j < dps.length; j++) {
                        total[j] = (total[j] || 0) + dps[j];
                    }
                    rows.push({
                        player: player,
                        dps: dps
                    });
                }
                sums.push({
                    name: "Total",
                    dps: total
                });
                var res = {
                    cols: cols,
                    rows: rows,
                    sums: sums
                };
                return res;
            }
        }
    });
}
{
    var buffDisplayHeight = 18;
    Vue.component("combat-replay-buff-display", {     
        props: ["buffarray"],    
        template: `
        <div v-if="buffarray.length > 0" class="d-flex buff-display" :style="{'height': height}">
            <div v-for="buff in buffarray" class="buff-container">
                <img :src="buff.buff.icon" :title="buff.buff.name" :alt="buff.buff.name" class="icon-s" />
                <div v-if="buff.state > 1" class="buff-number">{{buff.state}}</div>
            </div>
        </div>
        `,      
        computed: {
            height: function() {
                return buffDisplayHeight+ "px";
            },
        },
    });
    Vue.component("combat-replay-actor-buffs-stats-component", {
        mixins: [timeRefreshComponent],
        props: ["actorindex", "enemy", "buffstoshow"],
        template: `    <div class="d-flex flex-column justify-content-end" :style="{'height': height}">        <div v-if="isPresent('Fight Specifics')">            <combat-replay-buff-display :buffarray="data.fightSpecifics"></combat-replay-buff-display>        </div>        <div v-if="isPresent('Others')">            <combat-replay-buff-display :buffarray="data.others"></combat-replay-buff-display>        </div>        <div v-if="isPresent('Conditions')">            <combat-replay-buff-display :buffarray="data.conditions"></combat-replay-buff-display>        </div>              <div v-if="isPresent('Shared')">            <combat-replay-buff-display :buffarray="data.shared"></combat-replay-buff-display>        </div>          <div v-if="isPresent('Boons')">            <combat-replay-buff-display :buffarray="data.boons"></combat-replay-buff-display>        </div>        <div v-if="isPresent('Consumables')" >            <combat-replay-buff-display :buffarray="data.consumables"></combat-replay-buff-display>        </div>    </div>`,
        methods: {
            isPresent: function(type) {
                return this.buffsToShowSet.has(type) && this.presentBuffTypes.has(type);
            }
        },
        computed: {
            height: function() {
                var count = 0;
                for (var i = 0; i < this.buffstoshow.length; i++) {
                    count += this.isPresent(this.buffstoshow[i]) ? 1 : 0;
                }
                return buffDisplayHeight * count + "px";
            },
            buffsToShowSet: function() {
                return new Set(this.buffstoshow);
            },
            presentBuffTypes: function() {
                var res = new Set();
                for (var i = 0; i < this.buffData.length; i++) {
                    var data = this.buffData[i];
                    var id = data.id;
                    var buff = findSkill(true, id);
                    if (buff.consumable) {
                        res.add("Consumables");
                    } else if (buff.fightSpecific) {
                        res.add("Fight Specifics");
                    } else if (this.boons.has(id)) {
                        res.add("Boons");
                    } else if (this.offs.has(id)) {
                        res.add("Shared");
                    } else if (this.defs.has(id)) {
                        res.add("Shared");
                    } else if (this.sups.has(id)) {
                        res.add("Shared");
                    } else if (this.conditions.has(id)) {
                        res.add("Conditions");
                    } else {
                        res.add("Others");
                    }
                }
                return res;
            },
            boons: function () {
                var hash = new Set();
                for (var i = 0; i < logData.boons.length; i++) {
                    hash.add(logData.boons[i]);
                }
                return hash;
            },
            offs: function () {
                var hash = new Set();
                for (var i = 0; i < logData.offBuffs.length; i++) {
                    hash.add(logData.offBuffs[i]);
                }
                return hash;
            },
            defs: function () {
                var hash = new Set();
                for (var i = 0; i < logData.defBuffs.length; i++) {
                    hash.add(logData.defBuffs[i]);
                }
                return hash;
            },
            sups: function () {
                var hash = new Set();
                for (var i = 0; i < logData.supBuffs.length; i++) {
                    hash.add(logData.supBuffs[i]);
                }
                return hash;
            },
            conditions: function () {
                var hash = new Set();
                for (var i = 0; i < logData.conditions.length; i++) {
                    hash.add(logData.conditions[i]);
                }
                return hash;
            },
            actor: function () {
                return this.enemy ? logData.targets[this.actorindex] : logData.players[this.actorindex];
            },
            buffData: function () {
                return this.actor.details.boonGraph[0];
            },
            data: function () {
                var res = {
                    shared: [],
                    boons: [],
                    conditions: [],
                    fightSpecifics: [],
                    others: [],
                    consumables: []
                };
                for (var i = 0; i < this.buffData.length; i++) {
                    var data = this.buffData[i];
                    var id = data.id;
                    var arrayToFill = [];
                    var buff = findSkill(true, id);
                    if (buff.consumable) {
                        arrayToFill = res.consumables;
                        if (!this.buffsToShowSet.has("Consumables")) {
                            continue;
                        }
                    } else if (buff.fightSpecific) {
                        arrayToFill = res.fightSpecifics;
                        if (!this.buffsToShowSet.has("Fight Specifics")) {
                            continue;
                        }
                    } else if (this.boons.has(id)) {
                        arrayToFill = res.boons;
                        if (!this.buffsToShowSet.has("Boons")) {
                            continue;
                        }
                    } else if (this.offs.has(id)) {
                        arrayToFill = res.shared;
                        if (!this.buffsToShowSet.has("Shared")) {
                            continue;
                        }
                    } else if (this.defs.has(id)) {
                        arrayToFill = res.shared;
                        if (!this.buffsToShowSet.has("Shared")) {
                            continue;
                        }
                    } else if (this.sups.has(id)) {
                        arrayToFill = res.shared;
                        if (!this.buffsToShowSet.has("Shared")) {
                            continue;
                        }
                    } else if (this.conditions.has(id)) {
                        arrayToFill = res.conditions;
                        if (!this.buffsToShowSet.has("Conditions")) {
                            continue;
                        }
                    } else {
                        arrayToFill = res.others;
                        if (!this.buffsToShowSet.has("Others")) {
                            continue;
                        }
                    }
                    var t = this.timeToUse / 1000;
                    var val = findState(data.states, t, 0, data.states.length - 1);
                    if (val > 0) {
                        arrayToFill.push({
                            state: val,
                            buff: buff
                        });
                    }
                }
                return res;
            }
        }
    });
}
{
    Vue.component("combat-replay-player-stats-component", {
        props: ["playerindex", "time", "buffs", "rotation", "buffstoshow"],
        template: `    <div>        <combat-replay-actor-buffs-stats-component v-if="buffs && buffstoshow.length > 0" :time="time" :actorindex="playerindex" :enemy="false" :buffstoshow="buffstoshow"></combat-replay-actor-buffs-stats-component>        <div class="d-flex mb-1 mt-1 align-items-center player-status-rotation">            <combat-replay-player-status-component :time="time" :playerindex="playerindex"></combat-replay-player-status-component>            <combat-replay-actor-rotation-component v-if="rotation" :time="time" :actorindex="playerindex" :enemy="false"></combat-replay-actor-rotation-component>        </div>    </div>`
    });
}
{
    Vue.component("combat-replay-player-status-component", {
        props: ["playerindex", "time"],
        template: `    <div class="player-status" :style="{'background': getGradient(time, status)}">        <h6 class="actor-shorten text-center" :title="player.name">            <img :src="player.icon" :alt="player.profession" height="18" width="18">            {{player.name}}        </h6>        <p v-if="hasHealth" class="text-right cr-hp-display cr-hp-display-player">            {{(Math.round(100*getPercent(time))/100).toFixed(2)}} %        </p>    </div>`,
        methods: {         
            getPercent: function (time) {
                if (!this.hasHealth) {
                    return 100;
                }
                return findState(this.healths, time/1000.0, 0, this.healths.length - 1);
            },
            getGradient: function (time, status) {
                var color = status === 0 ? 'black' : status === 1 ? 'red' : status === 2 ? 'grey' : 'green';
                return computeGradient(color, this.getPercent(time));
            }
        },
        computed: {
            phase: function () {
                return logData.phases[0];
            },
            player: function () {
                return logData.players[this.playerindex];
            },
            healths: function () {
                return graphData.phases[0].players[this.playerindex].healthStates;
            },
            status: function () {
                var crPData = animator.playerData.get(this.player.uniqueID);
                var icon = crPData.getIcon(this.time);
                return icon === deadIcon ? 0 : icon === downIcon ? 1 : icon === dcIcon ? 2 : 3;
            },
            hasHealth: function () {
                return !!this.healths;
            }
        }
    });
}
{
    Vue.component("combat-replay-actor-rotation-component", {
        mixins: [timeRefreshComponent],
        props: ["actorindex", "enemy"],
        template: `    <div class="d-flex align-items-center actor-rotation">        <div v-if="rotation.current">            <img :src="rotation.current.skill.icon" :alt="rotation.current.skill.name" :title="rotation.current.skill.name"                class="icon-ll" :class="{'rot-cancelled': rotation.current.end === 2}">        </div>        <div v-else class="empty-icon-ll">            </div>        <div v-for="next in rotation.nexts">            <img :src="next.skill.icon" :alt="next.skill.name" :title="next.skill.name" class="icon-l" :class="{'rot-cancelled': next.end === 2}">        </div>    </div>`,
        methods: {
            findRotationIndex: function (rotation, timeS, start, end) {
                if (end === 0) {
                    return 0;
                }
                if (timeS < rotation[start][0]) {
                    return start;
                } else if (timeS > rotation[end][0] + rotation[end][2] / 1000.0) {
                    return end;
                }
                var id = Math.floor((end + start) / 2);
                var item, x, duration;
                if (id === start || id === end) {               
                    item = rotation[start];
                    x = item[0];
                    duration = item[2] / 1000.0;
                    if (timeS >= x && x + duration >= timeS) {
                        return start;
                    }
                    return end;
                }
                item = rotation[id];
                x = item[0];
                duration = item[2] / 1000.0;
                if (timeS < x) {
                    return this.findRotationIndex(rotation, timeS, start, id);
                } else if (timeS > x + duration) {
                    return this.findRotationIndex(rotation, timeS, id, end);
                } else {
                    return id;
                }
            }
        },
        computed: {
            actor: function () {
                return this.enemy ? logData.targets[this.actorindex] : logData.players[this.actorindex];
            },
            actorRotation: function () {
                return this.actor.details.rotation[0];
            },
            rotation: function () {
                var res = {
                    current: null,
                    nexts: []
                };
                var time = this.timeToUse / 1000.0;
                var id = this.findRotationIndex(this.actorRotation, time, 0, this.actorRotation.length - 1);
                var j, next;
                var item = this.actorRotation[id];
                var x = item[0];
                var skillId = item[1];
                var endType = item[3];
                var duration = item[2] / 1000.0;
                var skill = findSkill(false, skillId);
                if (x <= time && time <= x + duration) {
                    res.current = {
                        skill: skill,
                        end: endType
                    };
                    for (j = id + 1; j < this.actorRotation.length; j++) {
                        next = this.actorRotation[j];
                        res.nexts.push({
                            skill: findSkill(false, next[1]),
                            end: next[3]
                        });
                        if (res.nexts.length == 3) {
                            break;
                        }
                    }
                } else {
                    for (j = id; j < this.actorRotation.length; j++) {
                        next = this.actorRotation[j];
                        if (next[0] >= time) {
                            res.nexts.push({
                                skill: findSkill(false, next[1]),
                                end: next[3]
                            });
                        }
                        if (res.nexts.length == 3) {
                            break;
                        }
                    }
                }
                return res;
            },
        }
    });
}
{
    Vue.component("combat-replay-target-stats-component", {
        props: ["targetindex", "time", "buffstoshow"],
        template: `    <div>        <combat-replay-actor-buffs-stats-component v-if="buffstoshow.length > 0" :time="time" :actorindex="targetindex" :enemy="true" :buffstoshow="buffstoshow"></combat-replay-actor-buffs-stats-component>        <div class="d-flex mb-1 mt-1 align-items-center">            <combat-replay-target-status-component :time="time" :targetindex="targetindex"></combat-replay-target-status-component>        </div>    </div>`
    });
}
{
    Vue.component("combat-replay-target-status-component", {
        props: ["targetindex", "time"],
        template: `    <div class="d-flex d-flex flex-column justify-content-center align-items-center">        <div class="target-status" :style="{'background': getGradient(time)}">            <h6 class="actor-shorten text-center" :title="target.name + ' - ' + target.health + ' health'">                <img :src="target.icon" height="18" width="18">                {{target.name}}            </h6>            <p class="text-right cr-hp-display cr-hp-display-target">                {{(Math.round(100*getPercent(time))/100).toFixed(2)}} %            </p>        </div>        <div v-if="hasBreakbarPercent" class="cr-breakbar-display">            <div class="cr-breakbar-bar" :style="{'background': getBreakbarGradient(time)}">                <p class="text-center">                    {{(Math.round(100*getBreakbarPercent(time))/100).toFixed(2)}} %                </p>            </div>            <div style="transform: translate(0px, -22px);">                <ul class="nav nav-pills d-flex flex-row flex-wrap justify-content-center scale65">                    <li class="nav-item" v-for="(phase, id) in breakbarPhases" @click="updatePhaseTime(phase.start * 1000, phase.end * 1000, phase.name)"                        :data-original-title="phase.durationS + ' seconds'">                        <a class="nav-link">{{id + 1}} </a>                    </li>                </ul>            </div>        </div>    </div>`,
        methods: {
            getBreakbarPercent: function (time) {
                if (!this.hasBreakbarPercent) {
                    return 100.0;
                }
                return findState(this.breakbarPercent, time / 1000.0, 0, this.breakbarPercent.length - 1);
            },
            getPercent: function (time) {
                return findState(this.healths, time / 1000.0, 0, this.healths.length - 1);
            },
            getGradient: function (time) {
                return computeGradient("green", this.getPercent(time));
            },
            getBreakbarGradient: function (time) {
                var color = findState(this.breakbarStates, time / 1000.0, 0, this.breakbarStates.length - 1) ? "#20B2AA" : "#888888";
                return computeGradient(color, this.getBreakbarPercent(time));
            },
            updatePhaseTime: function (min, max, name) {
                animator.updateTime(min);
                sliderDelimiter.min = min;
                sliderDelimiter.max = max;
                sliderDelimiter.name = name;
            },
        },
        computed: {
            breakbarStates: function () {
                if (this.breakbarPhases.length === 0) {
                    return [[0, false]];
                }
                var res = [];
                var phases = this.breakbarPhases;
                for (var i = 0; i < phases.length; i++) {
                    var phase = phases[i];
                    if (i === 0 && phase.start > 0) {
                        res.push([0, false]);
                    }
                    // 2 seconds for colors
                    res.push([phase.start + 2, true]);
                    res.push([phase.end, false]);
                    if (i === phases.length - 1) {                   
                        res.push([this.phase.end, false]);
                    }
                }
                return res;
            },
            breakbarPhases: function () {
                if (!this.hasBreakbarPercent) {
                    return [];
                }
                return logData.phases.filter(phase => phase.breakbarPhase && phase.targets.indexOf(this.targetindex) > -1);
            },
            phase: function () {
                return logData.phases[0];
            },
            healths: function () {
                return graphData.phases[0].targetsHealthStatesForCR[this.targetindex];
            },
            breakbarPercent: function () {
                return graphData.phases[0].targetsBreakbarPercentStatesForCR[this.targetindex];
            },
            hasBreakbarPercent: function () {
                return !!this.breakbarPercent;
            },
            target: function () {
                return logData.targets[this.targetindex];
            }
        }
    });
}
{
    Vue.component("combat-replay-targets-stats-component", {
        props: ["time"],
        template: `    <div>        <ul class="nav nav-pills d-flex flex-row justify-content-center mb-1 scale65">            <li v-for="(buffType, index) in possibleBuffs" class="ml-1 mr-1">                <input :id="'crtar-possibleBuffs-' + index" type="checkbox" :value="buffType" v-model="buffsToShow" />                <label :for="'crtar-possibleBuffs-' + index">{{buffType}}</label>            </li>        </ul>        <div class="mt-1 combat-actor-status-container scrollable-y">            <div class="d-flex flex-column justify-content-center align-items-center">                <div v-for="(status, id) in targets" v-if="alive(status)" class="target-data ml-1 mr-1">                    <combat-replay-target-stats-component :time="time" :targetindex="id" :buffstoshow="buffsToShow">                    </combat-replay-target-stats-component>                </div>            </div>        </div>    </div>`,
        data: function () {
            return {
                buffsToShow: ["Others", "Boons", "Fight Specifics", "Conditions"]
            }
        },
        methods: {
            alive: function (status) {
                return status.start <= this.time && status.end >= this.time;
            }
        },
        computed: {
            possibleBuffs: function() {
                return [ "Boons", "Conditions", "Fight Specifics","Shared", "Others"];
            },
            targets: function () {
                var res = [];
                for (var i = 0; i < logData.targets.length; i++) {
                    var target = logData.targets[i];
                    var crTarget = animator.targetData.get(target.uniqueID);
                    if (crTarget) {
                        res.push({
                            start: crTarget.start,
                            end: crTarget.end
                        });
                    }
                }
                return res;
            },
        }
    });
}
{
    Vue.component("combat-replay-players-stats-component", {
        props: ["time", "selectedplayer", "selectedplayerid"],
        template: `    <div class="d-flex flex-row flex-wrap justify-content-center align-items-start mb-2">        <ul class="nav nav-pills d-flex flex-row justify-content-center mb-1 scale85">            <li class="nav-item">                <a class="nav-link" :class="{active: buffs}" @click="buffs = !buffs">                    Show Buffs                </a>            </li>            <li class="nav-item">                <a class="nav-link" :class="{active: rotation}" @click="rotation = !rotation">Show Rotation</a>            </li>        </ul>                            <ul class="nav nav-pills d-flex flex-row justify-content-center mb-1 scale65">            <li v-for="(buffType, index) in possibleBuffs" class="ml-1 mr-1">                <input :id="'crpl-possibleBuffs-' + index" type="checkbox" :value="buffType" v-model="buffsToShow" />                <label :for="'crpl-possibleBuffs-' + index">{{buffType}}</label>            </li>        </ul>        <div class="d-flex flex-column combat-actor-status-container scrollable-y" style="transform: translate(-42px,0);">            <div v-for="(group,id) in groups" v-if="group" class="d-flex flex-row align-items-center ml-2 mt-1">                <h5 style="width:70px" class="text-center mt-2">Group {{id}}</h5>                <div class="d-flex flex-row flex-wrap align-items-center ml-1 mr-1" style="width:280px;border: 2px solid #888;">                    <div v-for="player in group" class="player-data ml-1" :class="{active: selectedplayerindex === player.id}">                        <combat-replay-player-stats-component :time="time" :buffs="buffs" :rotation="rotation" :playerindex="player.id" :buffstoshow="buffsToShow"></combat-replay-player-stats-component>                    </div>                </div>            </div>        </div>    </div>`,
        data: function () {
            return {
                buffs: false,
                rotation: true,
                buffsToShow: ["Others", "Shared", "Consumables", "Boons"]
            };
        },
        computed: {
            possibleBuffs: function() {
                return [ "Boons", "Conditions", "Fight Specifics","Shared", "Consumables", "Others"];
            },
            selectedplayerindex: function () {
                if (this.selectedplayer) {
                    for (var i = 0; i < logData.players.length; i++) {
                        if (logData.players[i].uniqueID == this.selectedplayerid) {
                            return i;
                        }
                    }
                }
                return -1;
            },
            groups: function () {
                var res = [];
                var i = 0;
                for (i = 0; i < logData.players.length; i++) {
                    var playerData = logData.players[i];
                    if (playerData.isConjure) {
                        continue;
                    }
                    if (!res[playerData.group]) {
                        res[playerData.group] = [];
                    }
                    res[playerData.group].push(playerData);
                }
                return res;
            }
        }
    });
}
{
    Vue.component("combat-replay-ui-component", {
        props: ["mode", "light"],
        template: `    <div class="d-flex mt-2 justify-content-center">        <div class="d-flex flex-column align-items-center mr-2" style="margin-left: auto; min-width:450px;">            <combat-replay-damage-data-component :time="animationStatus.time"                :selectedplayer="animationStatus.selectedPlayer" :selectedplayerid="animationStatus.selectedPlayerID">            </combat-replay-damage-data-component>            <combat-replay-player-select-component :selectedplayerid="animationStatus.selectedPlayerID" :light="light"></combat-replay-player-select-component>            <combat-replay-extra-decorations-component :light="light"></combat-replay-extra-decorations-component>        </div>        <combat-replay-animation-control-component :light="light" :animated="animationStatus.animated"></combat-replay-animation-control-component>        <div class="d-flex flex-column align-items-center ml-2" style="margin-right: auto;min-width:450px;">            <combat-replay-status-data-component :time="animationStatus.time"                :selectedplayer="animationStatus.selectedPlayer" :selectedplayerid="animationStatus.selectedPlayerID">            </combat-replay-status-data-component>        </div>    </div>`,
        data: function () {
            return {
                animationStatus: reactiveAnimationData
            };
        },
        created() {
            animator = new Animator(logData.crData);
        },
        mounted() {
            animator.attachDOM();
        },
        activated() {
            if (this.animationStatus.animated && animator != null) {
                animator.startAnimate(false);
            }
        },
        deactivated() {
            if (this.animationStatus.animated && animator != null) {
                animator.stopAnimate(false);
            }
        },
    });
}
{
    Vue.component("combat-replay-player-select-component", {
        props: ['selectedplayerid', "light"],
        template: `    <div class="d-flex flex-row flex-wrap justify-content-center align-items-start mb-2">        <div class="d-flex flex-column scrollable-y" style="max-height: 250px;">            <div v-for="group in groups" class="d-flex flex-row align-items-center ml-2 mt-1" style="width:450px;">                <h5 class="mt-2" style="min-width:80px;max-width:80px;">Group {{group.id}}</h5>                <div class="d-flex flex-row flex-wrap align-items-center ml-1" style="max-width:370px;">                    <span v-for="player in group.players"                           @click="selectActor(player.uniqueID);"                           class="btn btn-small ply-btn" :class="{'active': selectedplayerid === player.uniqueID, 'btn-dark': !light, 'btn-light': light}" :title="player.name">                        <img v-if="player.isCommander" src="https://wiki.guildwars2.com/images/5/54/Commander_tag_%28blue%29.png" alt="Commander" class="icon">                        <img :src="player.icon" :alt="player.profession" class="icon">                        {{ player.name }}                    </span>                </div>            </div>        </div>    </div>`,
        methods: {
            selectActor: function (id) {
                animator.selectActor(id);
            }
        },
        computed: {
            groups: function () {
                var aux = [];
                var i = 0;
                for (i = 0; i < logData.players.length; i++) {
                    var playerData = logData.players[i];
                    if (playerData.isConjure) {
                        continue;
                    }
                    if (!aux[playerData.group]) {
                        aux[playerData.group] = [];
                    }
                    aux[playerData.group].push(playerData);
                }
                var noUndefinedGroups = [];
                for (i = 0; i < aux.length; i++) {
                    if (aux[i]) {
                        noUndefinedGroups.push({ id: i, players: aux[i] });
                    }
                }
                return noUndefinedGroups;
            }
        }
    });
}
{
    Vue.component("combat-replay-numberform-component", {
        props: ["minValue", "maxValue", "id", "placeholderValue"],
        template: `
        <div style="width: 100px;">
            <input class="form-control" type="number" :id="id"
                @onkeypress="return isNumber(event)" onpaste="return false;"
                    :value="placeholderValue" data-bind="value:replyNumber, fireChange: true"
                    :min="minValue" :max="maxValue">
        </div>
        `,
        methods: {
            isNumber: function (evt) {
                evt = (evt) ? evt : window.event;
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if ((charCode > 31 && charCode < 48) || charCode > 57) {
                    return false;
                }
                return true;
            }
        },
        mounted() {
            $("#" + this.id).on("input ", function () {
                var max = parseInt($(this).attr('max')) || 1e12;
                var min = parseInt($(this).attr('min'));
                if ($(this).val() > max) {
                    $(this).val(max);
                }
                else if ($(this).val() < min) {
                    $(this).val(min);
                }
            });
        }
    });
    Vue.component("combat-replay-extra-decorations-component", {
        props: ["light"],
        template: `    <div class="d-flex flex-column justify-content-center align-items-center">        <div class="form-check mb-2">            <input type="checkbox" class="form-check-input" id="subgroupCheck" checked v-on:change="getAnimator().toggleHighlightSelectedGroup()">            <label class="form-check-label" for="subgroupCheck">Highlight Selected Group</label>        </div>        <div class="d-flex flex-row justify-content-center">            <div class="mr-3">                <h3>Range Selectors</h3>                <div class="form-check mt-1 mb-2">                    <input type="checkbox" class="form-check-input" id="circle1Check" v-on:change="getAnimator().toggleRange(0)">                    <label class="form-check-label" for="circle1Check">Circle 1</label>                </div>                <div class="d-flex flex-row justify-content-between align-items-center">                    <span>Radius: </span>                    <combat-replay-numberform-component :minValue="1" :id="'circle1Text'"                                                        :placeholderValue="getAnimator().rangeControl[0].radius"></combat-replay-numberform-component>                </div>                <div class="form-check mt-1 mb-2">                    <input type="checkbox" class="form-check-input" id="circle2Check" v-on:change="getAnimator().toggleRange(1)">                    <label class="form-check-label" for="circle2Check">Circle 2</label>                </div>                <div class="d-flex flex-row justify-content-between align-items-center">                    <span>Radius: </span>                    <combat-replay-numberform-component :minValue="1" :id="'circle2Text'"                                                        :placeholderValue="getAnimator().rangeControl[1].radius"></combat-replay-numberform-component>                </div>                <div class="form-check mt-1 mb-2">                    <input type="checkbox" class="form-check-input" id="circle3Check" v-on:change="getAnimator().toggleRange(2)">                    <label class="form-check-label" for="circle3Check">Circle 3</label>                </div>                <div class="d-flex flex-row justify-content-between align-items-center">                    <span>Radius: </span>                    <combat-replay-numberform-component :minValue="1" :id="'circle3Text'"                                                        :placeholderValue="getAnimator().rangeControl[2].radius"></combat-replay-numberform-component>                </div>            </div>            <div class="ml-3">                <h3 data-original-title="Has an effect only when facing arrow are present">Cone Indicator</h3>                <div class="form-check mt-1 mb-2">                    <input type="checkbox" class="form-check-input" id="coneCheck" v-on:change="getAnimator().toggleConeDisplay()">                    <label class="form-check-label" for="coneCheck">Display Cone</label>                </div>                <div class="d-flex flex-row justify-content-between align-items-center mb-1">                    <span>Radius: </span>                    <combat-replay-numberform-component :minValue="1" :id="'coneRadiusText'"                                                        :placeholderValue="getAnimator().coneControl.radius"></combat-replay-numberform-component>                </div>                <div class="d-flex flex-row justify-content-between align-items-center mt-1">                    <span>Opening: </span>                    <combat-replay-numberform-component :minValue="1" :maxValue="360" :id="'coneAngleText'"                                                        :placeholderValue="getAnimator().coneControl.openingAngle"></combat-replay-numberform-component>                </div>            </div>        </div>    </div>`,
        methods: {
            getAnimator: function () {
                return animator;
            }
        },
        mounted() {
            $('#circle1Text').on("input ", function () {
                animator.setRangeRadius(0, $(this).val());
            });
            $('#circle2Text').on("input ", function () {
                animator.setRangeRadius(1, $(this).val());
            });
            $('#circle3Text').on("input ", function () {
                animator.setRangeRadius(2, $(this).val());
            });
            $('#coneRadiusText').on("input ", function () {
                animator.setConeRadius($(this).val());
            });
            $('#coneAngleText').on("input ", function () {
                animator.setConeAngle($(this).val());
            });
        }
    });
}
{
    Vue.component("combat-replay-animation-control-component", {
        props: ["light", "animated"],
        template: `    <div class="d-flex flex-column justify-content-center flex-wrap" :style="{'width': Math.max(canvasSize.x, canvasSize.y) + 'px'}">        <div class="d-flex flex-column justify-content-center align-items-center" :style="{'width': '100%', 'min-width': canvasSize.x + 'px', 'height': canvasSize.y + 'px', 'position': 'relative'}">            <canvas :width="canvasSize.x + 'px'" :height="canvasSize.y + 'px'" id="main-canvas" class="replay"></canvas>            <canvas :width="canvasSize.x + 'px'" :height="canvasSize.y + 'px'" id="bg-canvas" class="replay"></canvas>        </div>        <div class="animation-control">            <div class="d-flex justify-content-center">                <div @click="toggleAnimate();"                     class="btn btn-small" :class="{'btn-dark': !light, 'btn-light': light}" style="width: 50px;">{{animated ? "Pause" : "Play"}}</div>                <div @click="restartAnimate();" class="btn btn-small" :class="{'btn-dark': !light, 'btn-light': light}">                    Restart                </div>                <div @click="toggleBackwards();"                     class="btn btn-small" :class="{'active': backwards, 'btn-dark': !light, 'btn-light': light}">Backwards</div>            </div>                <div class="d-flex flex-row flex-wrap justify-content-center mt-1 mb-1">                    <div class="btn btn-ssmall" :class="{'active': backwards, 'btn-dark': !light, 'btn-light': light}"                        v-for="phase in phases" @click="updatePhaseTime(phase.start * 1000, phase.end * 1000, phase.name)"                        :data-original-title="phase.durationS + ' seconds'">                        {{phase.name}}                    </div>                </div>            <div class="d-flex justify-content-center slidercontainer">                <input style="min-width: 400px;" @input="updateTime($event.target.value)" type="range" min="0"                       :max="maxTime" value="0" class="slider" id="timeRange" :style="{'background': getSliderGradient()}">                <p style="position: absolute; color: black; pointer-events:none;">{{sliderDelimiter.name}}</p>                <input style="width: 70px; text-align: right;" class="ml-3 mr-1" type="text" id="timeRangeDisplay" value="0"                       @input="updateInputTime($event.target.value);">            </div>            <div class="d-flex justify-content-center">                <label v-for="speed in speeds" @click="setSpeed(speed)" :class="{'active': speed === selectedSpeed, 'btn-dark': !light, 'btn-light': light}"                       class="btn btn-ssmall">                    {{speed}}x                </label>            </div>            <p class="text-justify text-center">Double click on canvas to restore viewpoint</p>        </div>    </div>`,
        data: function () {
            return {
                speeds: [0.125, 0.25, 0.5, 1.0, 2.0, 4.0, 8.0, 16.0],
                selectedSpeed: 1,
                backwards: false,
                canvasSize: {
                    x: logData.crData.sizes[0],
                    y: logData.crData.sizes[1]
                },
                maxTime: logData.crData.maxTime,
                sliderDelimiter: sliderDelimiter
            };
        },
        computed: {
            phases: function() {
                return logData.phases.filter(phase => !phase.breakbarPhase);
            }
        },
        methods: {
            getSliderGradient: function () {
                var startPercent, endPercent;
                if (!this.sliderDelimiter || this.sliderDelimiter.min === -1) {
                    startPercent = 0;
                    endPercent = 100;
                } else {
                    var max = animator.times[animator.times.length - 1];
                    startPercent = this.sliderDelimiter.min / max * 100;
                    endPercent = this.sliderDelimiter.max / max * 100;
                }
                return computeSliderGradient("#888888", "#F3F3F3", startPercent, endPercent);
            },
            toggleBackwards: function () {
                this.backwards = animator.toggleBackwards();
            },
            toggleAnimate: function () {
                animator.toggleAnimate();
            },
            restartAnimate: function () {
                animator.restartAnimate();
            },
            setSpeed: function (speed) {
                animator.setSpeed(speed);
                this.selectedSpeed = speed;
            },
            updateTime: function (value) {
                animator.updateTime(value);
            },
            updatePhaseTime: function (min, max, name) {
                this.updateTime(min);
                this.sliderDelimiter.min = min;
                this.sliderDelimiter.max = max;
                this.sliderDelimiter.name = name;
            },
            updateInputTime: function (value) {
                animator.updateInputTime(value);
            }
        },
    });
}
{
    Vue.component("combat-replay-mechanics-list-component", {
        props: ['selectedplayerid'],
        template: `    <div class="d-flex flex-row flex-wrap justify-content-center align-items-center">        <div class="combat-replay-mechanics-list-container d-flex d-flex-row justify-content-center w-100 scrollable-y" style="max-width:450px">            <table class="table table-sm table-striped table-hover" cellspacing="0" width="100%">                <thead>                    <tr>                        <th style="min-width:80px">Time</th>                        <th style="min-width:120px" class="text-left combat-replay-mechanics-list-header position-relative">                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" title="Filter Mechanics">                                Mechanic <span class="caret"></span>                            </a>                            <ul class="dropdown-menu p-2 font-weight-normal">                                <li v-for="(mechanic, index) in mechanicsList" :key="index">                                    <input :id="'crml-mechanic-' + index" type="checkbox" v-model="mechanic.included"                                           @click.stop="stopClickEvent" />                                    <label :for="'crml-mechanic-' + index" @click.stop="stopClickEvent">                                        {{mechanic.shortName}}                                    </label>                                </li>                            </ul>                        </th>                        <th style="min-width:120px" class="text-left combat-replay-mechanics-list-header position-relative">                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" title="Filter Actors">                                Actor <span class="caret"></span>                            </a>                            <ul class="dropdown-menu p-2 font-weight-normal">                                <li v-for="(actor, index) in actorsList" :key="index">                                    <input :id="'crml-actor-' + index" type="checkbox" v-model="actor.included"                                           @click.stop="stopClickEvent" />                                    <label :for="'crml-actor-' + index" @click.stop="stopClickEvent">                                        {{actor.name}}                                    </label>                                </li>                            </ul>                        </th>                    </tr>                </thead>                <tbody>                    <tr v-for="event in filteredMechanicEvents" class="combat-replay-mechanics-list-row" :class="{active: event.actor.id === selectedplayerid}" @click="selectMechanic(event)">                        <td>{{(event.time / 1000).toFixed(2)}}s</td>                        <td class="text-left" :title="event.mechanic.name">{{event.mechanic.shortName}}</td>                        <td class="text-left">{{event.actor.name}}</td>                    </tr>                </tbody>            </table>        </div>    </div>`,
        data: function () {
            var mechanicEvents = [];
            var phase = logData.phases[0];
            var phaseTargets = phase.targets;
            for (var mechI = 0; mechI < graphData.mechanics.length; mechI++) {
                var graphMechData = graphData.mechanics[mechI];
                var logMechData = logData.mechanicMap[mechI];
                var mechData = { name: logMechData.name, shortName: logMechData.shortName };
                var pointsArray = graphMechData.points[0];
                var icd = logMechData.icd;
                // players
                if (!logMechData.enemyMech) {
                    for (var playerI = 0; playerI < pointsArray.length; playerI++) {
                        var lastTime = -1000000;
                        var points = pointsArray[playerI];
                        var player = logData.players[playerI];
                        for (var i = 0; i < points.length; i++) {
                            var time = points[i] * 1000; // when mechanic occured in seconds
                            if (icd === 0 || (time - lastTime > icd)) {
                                mechanicEvents.push({
                                    time: time,
                                    actor: { name: player.name, enemy: false, id: player.uniqueID },
                                    mechanic: mechData,
                                });
                            }
                            lastTime = time;
                        }
                    }
                } else {
                    // enemy
                    for (var targetI = 0; targetI < pointsArray.length; targetI++) {
                        var points = pointsArray[targetI];
                        var tarId = phaseTargets[targetI];
                        // target tracked in phase
                        if (tarId >= 0) {
                            var target = logData.targets[tarId];
                            for (var i = 0; i < points.length; i++) {
                                var time = points[i]; // when mechanic occured in seconds
                                mechanicEvents.push({
                                    time: time * 1000,
                                    actor: { name: target.name, enemy: true, id: -1 }, // target selection not supported
                                    mechanic: mechData,
                                });
                            }
                        } else {
                            // target not tracked in phase
                            for (var i = 0; i < points.length; i++) {
                                var time = points[i][0]; // when mechanic occured in seconds
                                mechanicEvents.push({
                                    time: time * 1000,
                                    actor: { name: points[i][1], enemy: true, id: -1 },
                                    mechanic: mechData,
                                });
                            }
                        }
                    }
                }
            }

            mechanicEvents.sort(function (a, b) {
                return a.time - b.time;
            });

            var actors = {};
            var mechanics = {};
            for (var i = 0; i < mechanicEvents.length; i++) {
                var event = mechanicEvents[i];
                var mechName = event.mechanic.name;
                var actorName = event.actor.name;
                if (!mechanics[mechName]) {
                    mechanics[mechName] = Object.assign({}, event.mechanic, { included: true });
                }
                if (!actors[actorName]) {
                    actors[actorName] = Object.assign({}, event.actor, { included: true });
                }
            }

            var actorsList = Object.values(actors); // could be sorted for more clarity
            actorsList.sort(function (a, b) {
                if (a.enemy !== b.enemy) {
                    // Sort enemies before players
                    return a.enemy ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });

            var mechanicsList = Object.values(mechanics);
            mechanicsList.sort(function (a, b) {
                return a.shortName.localeCompare(b.shortName);
            });

            return {
                mechanicEvents: mechanicEvents,
                actors: actors,
                actorsList: actorsList,
                mechanics: mechanics,
                mechanicsList: mechanicsList,
            };
        },
        methods: {
            selectMechanic: function (mechanic) {
                animator.updateTime(mechanic.time);
            },
            stopClickEvent: function (event) {
                event.stopPropagation();
            },
        },
        computed: {
            filteredMechanicEvents: function () {
                return this.mechanicEvents.filter(function (event) {
                    var actor = this.actors[event.actor.name];
                    var mechanic = this.mechanics[event.mechanic.name];
                    if (actor && !actor.included) {
                        return false;
                    }
                    if (mechanic && !mechanic.included) {
                        return false;
                    }
                    return true;
                }.bind(this))
            },
        },
    });
}
};

function mainLoad() {
    // make some additional variables reactive
    var i;

    for (i = 0; i < logData.phases.length; i++) {
        var phase = logData.phases[i];
        phase.durationS = phase.duration / 1000.0
        var times = [];
        var dur = phase.end - phase.start;
        var floorDur = Math.floor(dur);
        phase.needsLastPoint = dur > floorDur + 1e-3;
        for (var j = 0; j <= floorDur; j++) {
            times.push(j);
        }
        if (phase.needsLastPoint) {
            times.push(phase.end - phase.start);
        }
        phase.times = times;
        simpleLogData.phases.push({
            active: i === 0,
            focus: -1
        });
    }
    for (i = 0; i < logData.targets.length; i++) {
        simpleLogData.targets.push({
            active: true
        });
        logData.targets[i].id = i;
        logData.targets[i].dpsGraphCache = new Map();
    }
    for (i = 0; i < logData.players.length; i++) {
        var playerData = logData.players[i];
        simpleLogData.players.push({
            active: !!playerData.isPoV
        });
        playerData.dpsGraphCache = new Map();
        playerData.icon = urls[playerData.profession];
        playerData.id = i;
    }
    compileTemplates()
    new Vue({
        el: "#content",
        data: {
            light: typeof (window.theme) !== "undefined" ? (window.theme === 'yeti') : logData.lightTheme,
            mode: 0,
            cr: !!logData.crData
        },
        methods: {
            switchTheme: function (state) {
                if (state === this.light) {
                    return;
                }
                var style = this.light ? 'yeti' : 'slate';
                this.light = state;
                var newStyle = this.light ? 'yeti' : 'slate';
                document.body.classList.remove("theme-" + style);
                document.body.classList.add("theme-" + newStyle);
                if (storeTheme) storeTheme(newStyle);
                var theme = document.getElementById('theme');
                theme.href = themes[newStyle];
            },
            getLogData: function () {
                return logData;
            }
        },
        computed: {
            errorMessages: function () {
                return logData.logErrors;
            },
            uploadLinks: function () {
                var res = [
                    { 
                        key: "DPS Reports Link (EI)", 
                        url: "" 
                    },
                    { 
                        key: "DPS Reports Link (RH)", 
                        url: "" 
                    },
                    { 
                        key: "Raidar Link", 
                        url: "" 
                    }
                ];
                var hasAny = false;
                for (var i = 0; i < logData.uploadLinks.length; i++) {
                    var link = logData.uploadLinks[i];
                    if (link.length > 0) {
                        hasAny = true;
                        res[i].url = link;
                    }
                }
                return hasAny ? res : null;
            }
        },
        mounted() {
            var element = document.getElementById("loading");
            element.parentNode.removeChild(element);
        }
    });
    $("body").tooltip({
        selector: "[data-original-title]",
        html: true
    });
};

window.onload = function () {
    Vue.config.devtools = true;
    // trick from
    var img = document.createElement("img");
    img.style.display = "none";
    document.body.appendChild(img);
    img.onload = function () {
        mainLoad();
        document.body.removeChild(img);
    };
    img.onerror = function () {
        apiRenderServiceOkay = false;
        console.warn("Warning: GW2 Render service unavailable, switching to darthmaim-cdn");
        console.warn("More info at https://dev.gw2treasures.com/services/icons");
        mainLoad();
        document.body.removeChild(img);
    };
    img.src = "https://render.guildwars2.com/file/2FA9DF9D6BC17839BBEA14723F1C53D645DDB5E1/102852.png";
}
