import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

// Specify the data migration function in with-clause

actor {
  include MixinStorage();

  type Rating = {
    id : Nat;
    donorId : Principal;
    rating : Float;
  };

  public type FoodDonation = {
    id : Nat;
    donorName : Text;
    foodType : Text;
    quantity : Float;
    unit : Text;
    cookTime : Time.Time;
    storageCondition : StorageCondition;
    city : Text;
    neighborhood : Text;
    latitude : Float;
    longitude : Float;
    status : DonationStatus;
    claimedBy : ?Nat;
    timestamp : Time.Time;
  };

  public type StorageCondition = {
    #refrigerated;
    #roomTemperature;
    #hotStorage;
  };

  public type DonationStatus = {
    #pending;
    #accepted;
    #rejected;
    #confirmed;
    #pickedUp;
  };

  module FoodDonation {
    public func compareByTimestamp(d1 : FoodDonation, d2 : FoodDonation) : Order.Order {
      Int.compare(d1.timestamp, d2.timestamp);
    };
  };

  public type NGO = {
    id : Nat;
    name : Text;
    city : Text;
    neighborhood : Text;
    latitude : Float;
    longitude : Float;
    capacity : Nat;
    rating : Float;
    ratingCount : Nat;
  };

  module NGO {
    public func compareByRating(n1 : NGO, n2 : NGO) : Order.Order {
      Float.compare(n1.rating, n2.rating);
    };
  };

  public type Volunteer = {
    id : Nat;
    name : Text;
    city : Text;
    latitude : Float;
    longitude : Float;
    availability : Text;
    rating : Float;
  };

  module Volunteer {
    public func compareByName(v1 : Volunteer, v2 : Volunteer) : Order.Order {
      Text.compare(v1.name, v2.name);
    };
  };

  public type ImpactCounters = {
    totalMealsSaved : Nat;
    totalPeopleFed : Nat;
    co2Reduced : Float;
    cityBreakdown : [(Text, Nat)];
  };

  public type EntityType = {
    #hotel;
    #ngo;
    #volunteer;
    #admin;
  };

  public type UserProfile = {
    name : Text;
    city : Text;
    neighborhood : Text;
    entityType : EntityType;
  };

  type NGOWithRatings = {
    ngo : NGO;
    ratings : Map.Map<Nat, Rating>;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let foodDonations = Map.empty<Nat, FoodDonation>();
  let ngos = Map.empty<Nat, NGOWithRatings>();
  let volunteers = Map.empty<Nat, Volunteer>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var impactCounters : ImpactCounters = {
    totalMealsSaved = 50000;
    totalPeopleFed = 25000;
    co2Reduced = 12500.0;
    cityBreakdown = [
      ("Mumbai", 30000),
      ("Pune", 15000),
      ("Nagpur", 5000),
    ];
  };

  var nextDonationId = 1;
  var nextNgoId = 1;
  var nextVolunteerId = 1;
  var nextRatingId = 1;

  func initializeNGOWithRatings(ngo : NGO) : NGOWithRatings {
    {
      ngo;
      ratings = Map.empty<Nat, Rating>();
    };
  };

  let ngoData = [
    (0, "Robin Hood Army", "Mumbai", "Andheri", 19.1197, 72.8468, 1000, 4.8),
    (0, "Roti Bank", "Mumbai", "Dadar", 19.0176, 72.8562, 1500, 4.7),
    (0, "Feeding India", "Mumbai", "Bandra", 19.0507, 72.8401, 800, 4.6),
    (0, "Annadaan Foundation", "Pune", "Kothrud", 18.5148, 73.8077, 600, 4.5),
    (0, "Seva Sahayog", "Pune", "Shivajinagar", 18.5301, 73.8497, 900, 4.8),
    (0, "Bhojan Seva Trust", "Nagpur", "Dharampeth", 21.1575, 79.0882, 400, 4.6),
    (0, "Green Nagpur NGO", "Nagpur", "Sitabuldi", 21.1463, 79.0822, 500, 4.7),
  ];

  for ((_, name, city, neighborhood, lat, long, capacity, rating) in ngoData.values()) {
    let newNGO : NGO = {
      id = nextNgoId;
      name;
      city;
      neighborhood;
      latitude = lat;
      longitude = long;
      capacity;
      rating;
      ratingCount = 0;
    };
    ngos.add(nextNgoId, initializeNGOWithRatings(newNGO));
    nextNgoId += 1;
  };

  let volunteerData = [
    (0, "Suresh Kumar", "Mumbai", 19.0760, 72.8777, "Available mornings", 4.9),
    (0, "Priya Sharma", "Mumbai", 19.2183, 72.9781, "Available evenings", 4.7),
    (0, "Rahul Gupta", "Pune", 18.5167, 73.8567, "Available weekends", 4.8),
    (0, "Anjali Joshi", "Pune", 18.5204, 73.8567, "Available weekdays", 4.6),
    (0, "Manish Patel", "Nagpur", 21.1458, 79.0882, "Available full-time", 4.9),
  ];

  for ((_, name, city, lat, long, availability, rating) in volunteerData.values()) {
    let newVolunteer : Volunteer = {
      id = nextVolunteerId;
      name;
      city;
      latitude = lat;
      longitude = long;
      availability;
      rating;
    };
    volunteers.add(nextVolunteerId, newVolunteer);
    nextVolunteerId += 1;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getUserProfilesByEntityType(entityType : EntityType) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query profiles by entity type");
    };
    userProfiles.values().toArray().filter(func(profile) { profile.entityType == entityType });
  };

  public query ({ caller }) func isAdminCaller() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createFoodDonation(
    donorName : Text,
    foodType : Text,
    quantity : Float,
    unit : Text,
    cookTime : Time.Time,
    storageCondition : StorageCondition,
    city : Text,
    neighborhood : Text,
    latitude : Float,
    longitude : Float,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create food donations");
    };

    let newDonation : FoodDonation = {
      id = nextDonationId;
      donorName;
      foodType;
      quantity;
      unit;
      cookTime;
      storageCondition;
      city;
      neighborhood;
      latitude;
      longitude;
      status = #pending;
      claimedBy = null;
      timestamp = Time.now();
    };
    foodDonations.add(nextDonationId, newDonation);
    nextDonationId += 1;
    newDonation.id;
  };

  public query func getFoodDonation(id : Nat) : async ?FoodDonation {
    foodDonations.get(id);
  };

  public shared ({ caller }) func updateFoodDonationStatus(
    id : Nat,
    newStatus : DonationStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update donation status");
    };

    if (not foodDonations.containsKey(id)) {
      Runtime.trap("Donation not found");
    };
    let updatedDonation = {
      foodDonations.get(id).unwrap() with status = newStatus
    };
    foodDonations.add(id, updatedDonation);
  };

  public query func getAllDonations() : async [FoodDonation] {
    foodDonations.values().toArray();
  };

  public query func getPendingDonationsSortedByTimestamp() : async [FoodDonation] {
    foodDonations.values().toArray().filter(
      func(d) {
        switch (d.status) {
          case (#pending) { true };
          case (_) { false };
        };
      }
    ).sort(FoodDonation.compareByTimestamp);
  };

  public query func getAllNgosSortedByRating() : async [NGO] {
    ngos.values().toArray().map(func(n) { n.ngo }).sort(NGO.compareByRating);
  };

  public query func getNgosByCity(city : Text) : async [NGO] {
    ngos.values().toArray().map(func(n) { n.ngo }).filter(func(n) { n.city == city });
  };

  public query func getAllVolunteersSortedByName() : async [Volunteer] {
    volunteers.values().toArray().sort(Volunteer.compareByName);
  };

  public query func getVolunteersByCity(city : Text) : async [Volunteer] {
    volunteers.values().toArray().filter(func(v) { v.city == city });
  };

  public shared ({ caller }) func updateImpactCounters(
    mealsSaved : Nat,
    peopleFed : Nat,
    co2 : Float,
    city : Text,
    cityCount : Nat,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update impact counters");
    };

    let cityBreakdownArr = impactCounters.cityBreakdown;
    var cityFound = false : Bool;
    let updatedCityBreakdown = Array.tabulate(
      cityBreakdownArr.size(),
      func(i) {
        let (c, count) = cityBreakdownArr[i];
        if (c == city) {
          cityFound := true;
          return (c, cityCount);
        };
        (c, count);
      },
    );

    let finalCityBreakdown = if (cityFound) {
      updatedCityBreakdown;
    } else {
      updatedCityBreakdown.concat([(city, cityCount)]);
    };

    impactCounters := {
      totalMealsSaved = impactCounters.totalMealsSaved + mealsSaved;
      totalPeopleFed = impactCounters.totalPeopleFed + peopleFed;
      co2Reduced = impactCounters.co2Reduced + co2;
      cityBreakdown = finalCityBreakdown;
    };
  };

  public query func getImpactCounters() : async ImpactCounters {
    impactCounters;
  };

  public query ({ caller }) func getAvailableDonationsForVolunteers() : async [FoodDonation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view donations");
    };

    foodDonations.values().toArray().filter(
      func(d) {
        switch (d.status) {
          case (#accepted) { d.claimedBy == null };
          case (_) { false };
        };
      }
    ).sort(FoodDonation.compareByTimestamp);
  };

  public shared ({ caller }) func claimDonation(donationId : Nat, volunteerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim donations");
    };

    switch (foodDonations.get(donationId)) {
      case (null) {
        Runtime.trap("Donation not found");
      };
      case (?donation) {
        switch (donation.status) {
          case (#accepted) {
            switch (donation.claimedBy) {
              case (null) {
                let updatedDonation = { donation with claimedBy = ?volunteerId; status = #pickedUp };
                foodDonations.add(donationId, updatedDonation);
                ();
              };
              case (?otherVolunteer) {
                if (otherVolunteer == volunteerId) {
                  Runtime.trap("Donation already claimed by this volunteer");
                } else {
                  Runtime.trap("Donation already claimed by another volunteer");
                };
              };
            };
          };
          case (_) {
            Runtime.trap("Donation is not available for claiming");
          };
        };
      };
    };
  };

  public shared ({ caller }) func cancelClaim(donationId : Nat, volunteerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (foodDonations.get(donationId)) {
      case (null) {
        Runtime.trap("Donation not found");
      };
      case (?donation) {
        switch (donation.status) {
          case (#pickedUp) {
            switch (donation.claimedBy) {
              case (?claimer) {
                if (claimer == volunteerId) {
                  let updatedDonation = { donation with claimedBy = null; status = #accepted };
                  foodDonations.add(donationId, updatedDonation);
                  ();
                } else {
                  Runtime.trap("This claim does not belong to the current volunteer");
                };
              };
              case (null) {
                Runtime.trap("Donation is not currently claimed");
              };
            };
          };
          case (_) {
            Runtime.trap("Donation is not currently claimed");
          };
        };
      };
    };
  };

  public shared ({ caller }) func rateNgo(ngoId : Nat, ratingValue : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rate NGOs");
    };

    if (ratingValue < 1.0 or ratingValue > 5.0) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (ngos.get(ngoId)) {
      case (null) { Runtime.trap("NGO not found") };
      case (?ngoWithRatings) {
        let existingRating = ngoWithRatings.ratings.toArray().find(
          func((_, r : Rating)) { r.donorId == caller }
        );
        switch (existingRating) {
          case (?_) { Runtime.trap("You have already rated this NGO") };
          case (null) {
            let newRating : Rating = {
              id = nextRatingId;
              donorId = caller;
              rating = ratingValue;
            };
            nextRatingId += 1;
            let updateRatingCounterngos = ngoWithRatings.ratings.clone();
            updateRatingCounterngos.add(newRating.id, newRating);
            let oldNGO = ngoWithRatings.ngo;
            let updatedRatingCount = oldNGO.ratingCount + 1;
            let updatedAverageRating = ((oldNGO.rating * oldNGO.ratingCount.toFloat()) + ratingValue) / updatedRatingCount.toFloat();
            let newNGO : NGO = { oldNGO with rating = updatedAverageRating; ratingCount = updatedRatingCount };
            ngos.add(ngoId, { ngo = newNGO; ratings = updateRatingCounterngos });
          };
        };
      };
    };
  };

  public query ({ caller }) func getMyNgoRating(ngoId : Nat) : async ?Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own ratings");
    };

    switch (ngos.get(ngoId)) {
      case (null) { Runtime.trap("NGO not found") };
      case (?ngoWithRatings) {
        let match = ngoWithRatings.ratings.toArray().find(
          func((_, r : Rating)) { r.donorId == caller }
        );
        switch (match) {
          case (?(_, r)) { ?r.rating };
          case (null) { null };
        };
      };
    };
  };

  public query func getNgoRatingSummary(ngoId : Nat) : async (Float, Nat) {
    switch (ngos.get(ngoId)) {
      case (null) { Runtime.trap("NGO not found") };
      case (?ngoWithRatings) {
        (ngoWithRatings.ngo.rating, ngoWithRatings.ngo.ratingCount);
      };
    };
  };
};
