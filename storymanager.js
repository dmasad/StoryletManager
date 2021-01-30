
// Set up the general narrative manager
// -----------------------------------------------------------------------
var StoryManager = {};
StoryManager.storylets = {};

StoryManager.getAllStorylets = function(tag=null) {
	let allStorylets = [];
	let storylet, storylets, boundStorylet;
	for (let key in this.storylets) {
		storylet = this.storylets[key];
		if (tag === null || ("tags" in storylet && storylet.tags.includes(tag))) {
			// TODO: If using yield, this part will change
			storylets = storylet.generate();
			for (let i in storylets) {
				boundStorylet = storylets[i];
				if (!("priority" in boundStorylet)) boundStorylet.priority = 0;
				allStorylets.push(storylets[i]); 
			}
		}
	}
	return allStorylets;
}

StoryManager.getStorylets = function(n=null, tag=null, respect_interrupt=true) {
	/* 
		Get n storylets, prioritizing the highest-priority ones first.

		n: if not null, return at most n storylets
		tag: Only get storylets matching this tag
		respect_interrupt: if true, any interrupt storylet overrides n and priority

		For now assume that priorities are integers, but it would be nice
		to be more flexible.

	*/
	let allStorylets;
	allStorylets = this.getAllStorylets(tag);
	

	// Check for interruptions
	// TODO: Handle more than one interruption
	if (respect_interrupt) {
		for (let i in allStorylets)
			if (allStorylets[i].interrupt) return [allStorylets[i]];
	}

	// Get n stories in priority order
	if (n != null) {
		n = Math.min(n, allStorylets.length);
		if (n == 0) return [];
	}
	else n = allStorylets.length;
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

window.SM = StoryManager;