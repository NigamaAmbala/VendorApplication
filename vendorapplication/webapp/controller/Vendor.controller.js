sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
function (Controller, JSONModel, DateFormat,MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.app.vendorapplication.controller.Vendor", {
        onInit: function () {
            var today = new Date();  // Get the current date

            // Get the date picker element by its ID ("InputEstimatedtime")
            var oDateTimePicker = this.getView().byId("InputEstimatedtime");

            // Set the minimum date for the date picker to today's date
            oDateTimePicker.setMinDate(today);
        },
        onReservePressbtn: async function () {
            debugger
            var oView = this.getView();

            var sVendorName = oView.byId("InputVendorName").getValue();
            var sVendorPhno = oView.byId("InputVendorPhonenumber").getValue();
            var sVehicleNo = oView.byId("InputVehicleno").getValue();
            var sDriverName = oView.byId("InputDriverName").getValue();
            var sPhoneNo = oView.byId("InputPhonenumber").getValue();
            var sVehicleType = oView.byId("InputVehicletype").getValue();
            var sProcesstype = oView.byId("idprocessselect").getSelectedKey();
            var oDateTimePicker = oView.byId("InputEstimatedtime").getValue();
        

            // var oDateFormat = DateFormat.getDateTimeInstance({
            //     pattern: "yyyy-MM-dd HH:mm:ss" // Define your desired pattern here
            // });
 
            // var currentDate = new Date(); // Current system date and time
            // var formattedDateTime = oDateFormat.format(currentDate);
 

            var Reservemodel = new sap.ui.model.json.JSONModel({

                Vendorname:sVendorName,
                Vendorphno:sVendorPhno,
                Vehicleno: sVehicleNo,
                Drivername: sDriverName, 
                Phonenumber: sPhoneNo,
                Vehicletype: sVehicleType,
                Processtype: sProcesstype,
                Reservedtime: oDateTimePicker,
                // Parkinglot:sParkingLot
                Notify:  `Vendor "${sVendorName}" Requested for reserving the ParkingLot for the vehicle no "${sVehicleNo}" at "${oDateTimePicker}"`,
                
            });

            this.getView().setModel(Reservemodel, "reservemodel");
            const oModel = this.getView().getModel();
            const oPayload = this.getView().getModel("reservemodel").getProperty("/");

            // var isReserved = await this.checkParkingLotReservation12(oModel, sParkingLot);
            // if (isReserved) {
            //     sap.m.MessageBox.error(`Parking lot ${sParkingLot} is already reserved. Please select another parking lot.`, {
            //         title: "Reservation Information",
            //         actions: sap.m.MessageBox.Action.OK
            //     });
            //     return;
            // }
            //valid phone number
            if (!/^\d{10}$/.test(sPhoneNo)) {
                this.getView().byId("InputPhonenumber").setValueState("Error").setValueStateText("Mobile number must be a '10-digit number'.");
                return;
            } else {
                this.getView().byId("InputPhonenumber").setValueState("None");
            }
            //validate vehicle number
            if (!/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(sVehicleNo)) {  // Example format: XX00XX0000
                this.getView().byId("InputVehicleno").setValueState("Error").setValueStateText("Vehicle number format Should be like this 'AP21BE5678'.");
                return;
            } else {
                this.getView().byId("InputVehicleno").setValueState("None");
            }
            // Check if vendor mobile number, driver mobile number, or vehicle number already exists
           
                var bDriverNumberExists = await this.checkIfExists(oModel, "/RESERVATIONSSet", "Phonenumber", sPhoneNo);
                var bVehicleNumberExists = await this.checkIfExists(oModel, "/RESERVATIONSSet", "Vehicleno", sVehicleNo);
            
                if (bDriverNumberExists || bVehicleNumberExists) {
                    sap.m.MessageBox.error("driver number, or vehicle number already exists.");
                    return;
                }
            // Create the reservation entry
            try {
                await this.createData(oModel, oPayload, "/VENDORRESERVATIONSet");
                sap.m.MessageBox.success("Request Send Successfully");
                


            } catch (error) {  
                sap.m.MessageBox.error("Failed to create reservation. Please try again.");
                console.error("Error creating reservation:", error);
            }
            this.onclearPress1();
        },
        checkParkingLotReservation12: async function (oModel, plotNo) {
            return new Promise((resolve, reject) => {
                oModel.read("/Reservations", {
                    filters: [
                        new sap.ui.model.Filter("parkinglot_lotId", sap.ui.model.FilterOperator.EQ, plotNo)
                    ],
                    success: function (oData) {
                        resolve(oData.results.length > 0);
                    },
                    error: function () {
                        reject("An error occurred while checking parking lot reservation.");
                    }
                });
            });
        },
        checkIfExists: async function (oModel, sEntitySet, sProperty, sValue) {
            return new Promise((resolve, reject) => {
                oModel.read(sEntitySet, {
                    filters: [new sap.ui.model.Filter(sProperty, sap.ui.model.FilterOperator.EQ, sValue)],
                    success: (oData) => {
                        resolve(oData.results.length > 0);
                    },
                    error: (oError) => {
                        reject(oError);
                    }
                });
            });
        },
        onclearPress1: function () {
            var oView = this.getView();
            var sVendorName = oView.byId("InputVendorName").setValue();
            var sVendorphno = oView.byId("InputVendorPhonenumber").setValue();
            var sVehicleNo = oView.byId("InputVehicleno").setValue();
            var sDriverName = oView.byId("InputDriverName").setValue();
            var sPhoneNo = oView.byId("InputPhonenumber").setValue();
            var sVehicleType = oView.byId("InputVehicletype").setValue();
            var sProcesstype = oView.byId("idprocessselect").setValue();
            var oDateTimePicker = oView.byId("InputEstimatedtime").setValue();
        },
        onServiceTypeChange: function (oEvent) {
            // Get the selected service type from the dropdown
            var sServiceType = oEvent.getSource().getSelectedKey();
     
            // Get the reference to the slots dropdown (Combobox)
            var oSlotsComboBox = this.getView().byId("idparkingLotSelect");
     
            // Create filters based on selected service type and available status
            var aFilters = [
              new sap.ui.model.Filter("Processtype", sap.ui.model.FilterOperator.EQ, sServiceType),
              new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "AVAILABLE")
            ];
     
            // Apply the filters to the items aggregation of the slots dropdown
            oSlotsComboBox.bindAggregation("items", {
              path: "/ParkingslotsSet",
              template: new sap.ui.core.Item({
                key: "{Parkinglot}",
                text: "{Parkinglot}"
              }),
              filters: aFilters
            });
          },

    });
});
