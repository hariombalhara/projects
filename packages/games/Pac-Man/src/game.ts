import world from './world'
import obstructionsConfig from '../config/obstructions-config'
import Creature from './Creature'
var game = {
	init: function () {
		world.create(obstructionsConfig);
		world.addCreature(new Creature(Creature.TypeEnum.PACMAN));
		world.start();
	}
};
export default game;
