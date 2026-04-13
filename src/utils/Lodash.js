import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import each from 'lodash/each';
import merge from 'lodash/merge';
import findIndex from 'lodash/findIndex';
import filter from 'lodash/filter';
import find from 'lodash/find';
import reduce from 'lodash/reduce';
import some from 'lodash/some';
import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import omit from 'lodash/omit';
import every from 'lodash/every';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
/*
import has from "lodash/has";



import map from "lodash/map";

import assign from "lodash/assign";
import defaults from "lodash/defaults";

import pick from "lodash/pick";
import remove from "lodash/remove";

import take from "lodash/take";
import drop from "lodash/drop";
*/

const _ = {
  isObject,
  each,
  isString,
  isArray,
  merge,
  findIndex: findIndex,
  filter: filter,
  find: find,
  reduce: reduce,
  some: some,
  isEqual: isEqual,
  keys: keys,
  omit: omit,
  every: every,
  cloneDeep: cloneDeep,
  debounce,
  /*
	has: has,



	map: map,

	assign: assign,
	defaults: defaults,


	pick: pick,
	remove: remove,


	take: take,
	drop: drop,
	*/
};

export default _;
