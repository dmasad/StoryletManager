
// Choose one of an array
var randomChoice = function(vals) {
	return vals[Math.floor(Math.random() * vals.length)];
};

// Set up the general narrative manager
// -----------------------------------------------------------------------
var NarrativeManager = {};
NarrativeManager.storylets = {};

NarrativeManager.getAllStorylets = function() {
	let allStorylets = [];
	for (let key in this.storylets) {
		let storylets = this.storylets[key].generate();
		for (let i in storylets) allStorylets.push(storylets[i]);
	}
	return allStorylets;
}

NarrativeManager.getNStorylets = function(n) {
	/* 
		Get N storylets, prioritizing the highest-priority ones first.
		For now assume that priorities are integers, but it would be nice
		to be more flexible.

	*/
	let allStorylets = this.getAllStorylets();
	n = Math.min(n, allStorylets.length);
	if (n == 0) return [];
	let selectedStorylets = [];
	// First sort by ascending priority:
	allStorylets.sort((a, b) => b.priority - a.priority);
	let currentPriority = allStorylets[0].priority;
	while (selectedStorylets.length < n) {
		let priorityStorylets = allStorylets.filter(s => s.priority==currentPriority);
		priorityStorylets.sort((a, b) => (Math.random() - Math.random()));
		let nAdd = Math.min(n - selectedStorylets.length, priorityStorylets.length);
		for (let i=0; i<nAdd; i++) selectedStorylets.push(priorityStorylets.pop());
		currentPriority--;
	}
	return selectedStorylets;
}

window.NM = NarrativeManager;