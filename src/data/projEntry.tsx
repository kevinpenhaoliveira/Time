import Spacer from "components/layout/Spacer.vue";
import { jsx } from "features/feature";
import { createResource, trackBest, trackOOMPS, trackTotal } from "features/resources/resource";
import { branchedResetPropagation, createTree, GenericTree } from "features/trees/tree";
import { globalBus } from "game/events";
import { createLayer, GenericLayer } from "game/layers";
import player, { PlayerData } from "game/player";
import { DecimalSource } from "lib/break_eternity";
import Decimal, { format, formatTime } from "util/bignum";
import { render } from "util/vue";
import { computed, toRaw } from "vue";

export const main = createLayer(() => {
    const time = createResource<DecimalSource>(0, "time");
    const best = trackBest(time);
    const total = trackTotal(time);

    const pointGain = computed(() => {
        // eslint-disable-next-line prefer-const
        let gain = new Decimal(1);
        return gain;
    });
    globalBus.on("update", diff => {
        time.value = Decimal.add(time.value, Decimal.times(pointGain.value, diff));
    });
    const oomps = trackOOMPS(time, pointGain);

    const taskSpeed = computed(() => {
        // eslint-disable-next-line prefer-const
        let speed = new Decimal(1);
        return speed;
    });

    return {
        id: "main",
        name: "Tree",
        display: jsx(() => (
            <>
                <div v-show={player.devSpeed === 0}>Game Paused</div>
                <div v-show={player.devSpeed && player.devSpeed !== 1}>
                    Dev Speed: {format(player.devSpeed || 0)}x
                </div>
                <div v-show={player.offlineTime != undefined}>
                    Offline Time: {formatTime(player.offlineTime || 0)}
                </div>
                <div>
                    <span v-show={Decimal.lt(time.value, "1e1000")}>You have saved </span>
                    <h2>{format(time.value)}</h2>
                    <span v-show={Decimal.lt(time.value, "1e1e6")}> time</span>
                </div>
                <div v-show={Decimal.gt(pointGain.value, 0)}>({oomps.value})</div>
                <div>
                    Time is used at a rate of {format(taskSpeed.value)} time/second when performing
                    tasks
                </div>
                <Spacer />
            </>
        )),
        time,
        best,
        total,
        oomps
    };
});

export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<PlayerData>
): Array<GenericLayer> => [main];

export const hasWon = computed(() => {
    return false;
});

/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<PlayerData>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
