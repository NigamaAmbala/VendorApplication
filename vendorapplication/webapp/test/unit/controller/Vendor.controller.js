/*global QUnit*/

sap.ui.define([
	"comapp/vendorapplication/controller/Vendor.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Vendor Controller");

	QUnit.test("I should test the Vendor controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
