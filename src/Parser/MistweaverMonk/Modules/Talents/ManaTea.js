// Modified from Original Code by Blazyb and his Innervate module.
import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber , formatThousands } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

const baseMana = 1100000;
const manaTeaReduction = .5;

class ManaTea extends Module {
  manaSavedMT = 0;
  manateaCount = 0;

  effCasts = 0;
  enmCasts = 0;
  efCasts = 0;
  lcCasts = 0;
  remCasts = 0;
  revCasts = 0;
  vivCasts = 0;
  rjwCasts = 0;

  nonManaCasts = 0;
  castsUnderManaTea = 0;

  hasLifeCycles = false;
  casted = false;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
    if (this.owner.selectedCombatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id)) {
      this.hasLifeCycles = true;
    }
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.MANA_TEA_TALENT.id === spellId) {
      this.manateaCount++;
      debug && console.log('Mana Tea Cast +1. Total:' + this.manateaCount);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(this.owner.selectedCombatant.hasBuff(SPELLS.MANA_TEA_TALENT.id)) {
      debug && console.log('Mana Tea Buff present');
      if(SPELLS.EFFUSE.id === spellId) {
        this.addToManaSaved(SPELLS.EFFUSE.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.effCasts++;
        this.casted = true;
      }
      debug && console.log('Eff Check');
      if(SPELLS.ENVELOPING_MISTS.id === spellId) {
        this.addToManaSaved(SPELLS.ENVELOPING_MISTS.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.enmCasts++;
        this.casted = true;
      }
      debug && console.log('Enm Check');
      if(SPELLS.ESSENCE_FONT.id === spellId) {
        this.addToManaSaved(SPELLS.ESSENCE_FONT.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.efCasts++;
        this.casted = true;
      }
      debug && console.log('Ef Check');
      if(SPELLS.LIFE_COCOON.id === spellId) {
        this.addToManaSaved(SPELLS.LIFE_COCOON.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.lcCasts++;
        this.casted = true;
      }
      debug && console.log('LC Check');
      if(SPELLS.RENEWING_MIST.id === spellId) {
        this.addToManaSaved(SPELLS.RENEWING_MIST.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.remCasts++;
        this.casted = true;
      }
      debug && console.log('REM Check');
      if(SPELLS.REVIVAL.id === spellId) {
        this.addToManaSaved(SPELLS.REVIVAL.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.revCasts++;
        this.casted = true;
      }
      debug && console.log('Rev Check');
      if(SPELLS.VIVIFY.id === spellId) {
        this.addToManaSaved(SPELLS.VIVIFY.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.vivCasts++;
        this.casted = true;
      }
      debug && console.log('Viv Check');
      if(SPELLS.REFRESHING_JADE_WIND_TALENT.id === spellId) {
        this.addToManaSaved(SPELLS.REFRESHING_JADE_WIND_TALENT.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.rjwCasts++;
        this.casted = true;
      }
      debug && console.log('RJW Check');
      // Capture any Non Mana casts during Mana Tea
      if(!this.casted) {
        this.nonManaCasts++;
        this.casted = false;
      }
    }
  }

  addToManaSaved(spellBaseMana, spellId) {
    // If we cast TFT -> Viv, mana cost of Viv is 0
    if(this.owner.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id) && SPELLS.VIVIFY.id === spellId) {
        this.nonManaCasts++;
        return;
    }
    // Lifecycles reduces the mana cost of both Vivify and Enveloping Mists.  We must take that into account when calculating mana saved.
    if(this.hasLifeCycles) {
      if(this.owner.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_VIVIFY_BUFF.id) && spellId === SPELLS.VIVIFY.id) {
        this.manaSavedMT += (((baseMana * spellBaseMana) * (1 - (SPELLS.LIFECYCLES_VIVIFY_BUFF.manaPercRed))) * (1 - manaTeaReduction));
        debug && console.log('LC Viv Cast');
      } else if((this.owner.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id) && spellId === SPELLS.ENVELOPING_MISTS.id)) {
        this.manaSavedMT += (((baseMana * spellBaseMana) * (1 - (SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.manaPercRed))) * (1 - manaTeaReduction));
      } else {
        this.manaSavedMT += ((baseMana * spellBaseMana) * (1 - manaTeaReduction));
      }
    } else {
      this.manaSavedMT += ((baseMana * spellBaseMana) * (1 - manaTeaReduction));
    }
  }
  on_finished() {
    if(debug) {
      console.log("Mana Tea Casted: " + this.manateaCount);
      console.log("Mana saved: " + this.manaSavedMT);
      console.log("Avg. Mana saved: " + (this.manaSavedMT/this.manateaCount));
      console.log("Total Casts under Mana Tea: " + this.castsUnderManaTea);
      console.log("Avg Casts under Mana Tea: " + (this.castsUnderManaTea/this.manateaCount));
      console.log("Free spells cast: " + this.nonManaCasts);
    }
  }

  suggestions(when) {
    const abilityTracker = this.owner.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const manaTea = getAbility(SPELLS.MANA_TEA_TALENT.id);
    const mtCasts = manaTea.casts || 0;
    const avgMTsaves = this.manaSavedMT / mtCasts || 0;

    when(avgMTsaves).isLessThan(180000)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<span>Your mana spent during <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> can be improved. Always aim to cast your highest mana spells such as <SpellLink id={SPELLS.ESSENCE_FONT.id} /> or <SpellLink id={SPELLS.VIVIFY.id} />.</span>)
        .icon(SPELLS.MANA_TEA_TALENT.icon)
        .actual(`${formatNumber(avgMTsaves)} average mana saved per Mana Tea cast`)
        .recommended(`${(recommended / 1000).toFixed(0)}k average mana saved is recommended`)
        .regular(recommended - 30000).major(recommended - 60000);
    });
  }

  statistic() {
    const abilityTracker = this.owner.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const manaTea = getAbility(SPELLS.MANA_TEA_TALENT.id);
    const mtCasts = manaTea.casts || 0;
    const avgMTsaves = this.manaSavedMT / mtCasts || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MANA_TEA_TALENT.id} />}
        value={`${formatNumber(avgMTsaves)}`}
        label={(
          <dfn
            data-tip={`
                During your ${this.manateaCount} <a href="http://www.wowhead.com/spell=197908" target="_blank" rel="noopener noreferrer">Mana Teas</a> saved the following mana (${formatThousands(this.manaSavedMT / this.owner.fightDuration * 1000 * 5)} MP5):
                <ul>
                ${this.efCasts > 0 ?
                `<li>${(this.efCasts)} Essence Font casts</li>`
                : ""
                }
                ${this.efCasts > 0 ?
                `<li>${(this.vivCasts)} Vivfy casts</li>`
                : ""
                }
                ${this.efCasts > 0 ?
                `<li>${(this.enmCasts)} Enveloping Mists casts</li>`
                : ""
                }
                <li>${(this.rjwCasts + this.revCasts + this.remCasts + this.lcCasts + this.effCasts)} other spells casted.</li>
                <li>${(this.nonManaCasts)} non-mana casts during Mana Tea</li>
            </ul>`}
          >
            Average mana saved
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default ManaTea;
