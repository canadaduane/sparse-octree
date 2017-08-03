import { Box3 } from "math-ds";
import { Octant } from "./Octant.js";
import { OctreeIterator } from "./OctreeIterator.js";
import { OctreeRaycaster } from "./OctreeRaycaster.js";

/**
 * A 3D box.
 *
 * @type Box3
 * @private
 */

const box3 = new Box3();

/**
 * Recursively calculates the depth of the given octree.
 *
 * @private
 * @param {Octant} octant - An octant.
 * @return {Number} The depth.
 */

function getDepth(octant) {

	const children = octant.children;

	let result = 0;
	let i, l, d;

	if(children !== null) {

		for(i = 0, l = children.length; i < l; ++i) {

			d = 1 + getDepth(children[i]);

			if(d > result) {

				result = d;

			}

		}

	}

	return result;

}

/**
 * Recursively collects octants that lie inside the specified region.
 *
 * @private
 * @param {Octant} octant - An octant.
 * @param {Frustum|Box3} region - A region.
 * @param {Array} result - A list to be filled with octants that intersect with the region.
 */

function cull(octant, region, result) {

	const children = octant.children;

	let i, l;

	box3.min = octant.min;
	box3.max = octant.max;

	if(region.intersectsBox(box3)) {

		if(children !== null) {

			for(i = 0, l = children.length; i < l; ++i) {

				cull(children[i], region, result);

			}

		} else {

			result.push(octant);

		}

	}

}

/**
 * Recursively fetches all octants with the specified depth level.
 *
 * @private
 * @param {Octant} octant - An octant.
 * @param {Number} level - The target depth level.
 * @param {Number} depth - The current depth level.
 * @param {Array} result - A list to be filled with the identified octants.
 */

function findOctantsByLevel(octant, level, depth, result) {

	const children = octant.children;

	let i, l;

	if(depth === level) {

		result.push(octant);

	} else if(children !== null) {

		++depth;

		for(i = 0, l = children.length; i < l; ++i) {

			findOctantsByLevel(children[i], level, depth, result);

		}

	}

}

/**
 * An octree that subdivides space for fast spatial searches.
 *
 * @implements {Iterable}
 */

export class Octree {

	/**
	 * Constructs a new octree.
	 *
	 * @param {Vector3} [min] - The lower bounds of the tree.
	 * @param {Vector3} [max] - The upper bounds of the tree.
	 */

	constructor(min, max) {

		/**
		 * The root octant.
		 *
		 * @type {Octant}
		 * @default null
		 */

		this.root = (min !== undefined && max !== undefined) ? new Octant(min, max) : null;

	}

	/**
	 * The lower bounds of the root octant.
	 *
	 * @type {Vector3}
	 */

	get min() { return this.root.min; }

	/**
	 * The upper bounds of the root octant.
	 *
	 * @type {Vector3}
	 */

	get max() { return this.root.max; }

	/**
	 * The children of the root octant.
	 *
	 * @type {Octant[]}
	 */

	get children() { return this.root.children; }

	/**
	 * Calculates the center of this octree.
	 *
	 * @param {Vector3} [target] - A target vector. If none is provided, a new one will be created.
	 * @return {Vector3} A vector that describes the center of this octree.
	 */

	getCenter(target) { return this.root.getCenter(target); }

	/**
	 * Calculates the size of this octree.
	 *
	 * @param {Vector3} [target] - A target vector. If none is provided, a new one will be created.
	 * @return {Vector3} A vector that describes the size of this octree.
	 */

	getDimensions(target) { return this.root.getDimensions(target); }

	/**
	 * Calculates the current depth of this octree.
	 *
	 * @return {Number} The depth.
	 */

	getDepth() { return getDepth(this.root); }

	/**
	 * Recursively collects octants that intersect with the specified region.
	 *
	 * @param {Frustum|Box3} region - A region.
	 * @return {Octant[]} The octants.
	 */

	cull(region) {

		const result = [];

		cull(this.root, region, result);

		return result;

	}

	/**
	 * Fetches all octants with the specified depth level.
	 *
	 * @param {Number} level - The depth level.
	 * @return {Octant[]} The octants.
	 */

	findOctantsByLevel(level) {

		const result = [];

		findOctantsByLevel(this.root, level, 0, result);

		return result;

	}

	/**
	 * Finds the octants that intersect with the given ray. The intersecting
	 * octants are sorted by distance, closest first.
	 *
	 * @param {Raycaster} raycaster - A raycaster.
	 * @param {Array} [intersects] - A list to be filled with intersecting octants.
	 * @return {Octant[]} The intersecting octants.
	 */

	raycast(raycaster, intersects = []) {

		OctreeRaycaster.intersectOctree(this, raycaster, intersects);

		return intersects;

	}

	/**
	 * Returns an iterator that traverses the octree and returns leaf nodes.
	 *
	 * When a cull region is provided, the iterator will only return leaves that
	 * intersect with that region.
	 *
	 * @param {Frustum|Box3} [region] - A cull region.
	 * @return {OctreeIterator} An iterator.
	 */

	leaves(region) {

		return new OctreeIterator(this, region);

	}

	/**
	 * Returns an iterator that traverses the octree and returns all leaf nodes.
	 *
	 * @return {OctreeIterator} An iterator.
	 */

	[Symbol.iterator]() {

		return new OctreeIterator(this);

	}

}