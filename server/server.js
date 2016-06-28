Meteor.startup(function() {
	if ( HousesCollection.find().count() === 0) {
		var houses = [
			{
				name: 'Stephan',
				plants: [{
					color: 'red',
					instructions: '3 pots/weeks'
				}, {
					color: 'white',
					instructions: 'keep humid'
				}]
			},
			{
				name: 'Boris',
				plants: [{
					color: 'blue',
					instructions: '5 pots/month'
				}, {
					color: 'black',
					instructions: 'don\'t touch'
				}]
			},
			{
				name: 'Franck',
				plants: [{
					color: 'Grey',
					instructions: 'Need rice'
				}, {
					color: 'Pink',
					instructions: 'give flies'
				}]
			}
		];
		while ( houses.length > 0 ) {
			HousesCollection.insert(houses.pop());
		}
		console.log('Added fixtures');
	}
});
