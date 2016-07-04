LocalHouse = new Mongo.Collection(null);

// test 


var newHouse = {
	name: '',
	plants: [],
	lastsave: 'never',
	status: 'unsaved'
};

Session.setDefault('selectedHouseId', '');

Tracker.autorun(function () {
	console.log("The selectedHouse id: " + Session.get("selectedHouseId")
		);
});

Template.selectHouse.helpers({
		'housesNameId': function () {
			return HousesCollection.find({}, {fields: {name:1, _id:1} });
		},
		'isSelected': function () {
			return Session.equals('selectedHouseId', this._id) ? 'selected' : '';
		}
});

Template.selectHouse.events({
	'change #selectHouse': function (evt) {
		var selectedId = evt.currentTarget.value;
		var newId = LocalHouse.upsert(
			selectedId,
			HousesCollection.findOne(selectedId) || newHouse
			).insertedId;
		if (!newId) newId = selectedId;
		Session.set('selectedHouseId', newId);
	}
});


Template.plantDetails.events({
	'click button.water': function (evt) {
		var plantId = $(evt.currentTarget).attr('data-id');
		Session.set(plantId, true);
		var lastvisit = new Date();
		HousesCollection.update({
			_id: Session.get("selectedHouseId")
		},{
			$set: {
				lastvisit: lastvisit
			}
		});
	}
});

Template.plantDetails.helpers({
	'isWatered': function () {
		var plantId = Session.get("selectedHouseId") + "-" + this.color;
		return Session.get(plantId) ? 'disabled' : '';
	}
});

Template.houseForm.events({
	'keyup input#house-name': function (evt) {
		evt.preventDefault();
		var modifier = {$set: {'name': evt.currentTarget.value}};
		updateLocalHouse(Session.get('selectedHouseId'), modifier);
	},
	'click button.addPlant': function (evt) {
		evt.preventDefault();
		var newPlant = {color: '', instruction: ''};
		var modifier = {$push: {'plants': newPlant}};
		updateLocalHouse(Session.get('selectedHouseId'), modifier);
	},
	'click button#save-house': function (evt) {
		evt.preventDefault();
		console.log('click on save house')
		var id = Session.get('selectedHouseId');
		var modifier = {$set: {'lastsave': new Date()}};
		updateLocalHouse(id, modifier);
		// update the server database
		HousesCollection.upsert(
			{_id: id},
			LocalHouse.findOne(id)
			);
	},
});

Template.plantFieldset.events({
	'keyup input.color, keyup input.instructions': function (evt) {
		evt.preventDefault();
		var index = evt.target.getAttribute('data-index');
		var field = evt.target.getAttribute('class');
		var plantProperty = 'plants.' + index + '.' + field;
		var modifier = {$set: {}};
		modifier['$set'][plantProperty] = evt.target.value;
		updateLocalHouse(Session.get('selectedHouseId'), modifier);
	},
	'click button.removePlant': function(evt) {
		evt.preventDefault();
		var index = evt.target.getAttribute('data-index');
		var plants = Template.parentData(1).plants;
		console.log(index);
		console.log(plants);
		plants.splice(index, 1);
		var modifier = {$set: {'plants': plants}};
		updateLocalHouse(Session.get('selectedHouseId'), modifier);
	}
});

Template.showHouse.events({
	'click button#delete': function(evt) {
		var id = this._id;
		var deleteConfirmation = confirm('Really delete this house?');
		if (deleteConfirmation) {
			HousesCollection.remove(id);
		}
	}
});

Template.registerHelper('selectedHouse', function () {
	return LocalHouse.findOne(Session.get('selectedHouseId'));
});

Template.registerHelper('withIndex', function (list) {
	var withIndex = _.map(list, function (v,i) {
		if (v === null) return;
		v.index = i;
		return v;
	});
	return withIndex;
});

updateLocalHouse = function (id, modifier) {
	console.log(modifier);
	LocalHouse.update(
			{
				'_id': id
			},
			modifier
		);
};
