// ====================================
// ARCTIC FOX — Google Apps Script (Multi-Sheet Controller)
// ====================================
// This script processes three separate actions from the React app:
// 1. "signup"/"login" -> stores credentials in sheet "Users"
// 2. "customize"      -> saves image designs in Google Drive and logs details in sheet "Customizations"
// 3. "place_order"    -> saves complete orders in sheet "Orders"
//
// SETUP INSTRUCTIONS:
// 1. Create a new Google Sheet.
// 2. Go to Extensions > Apps Script.
// 3. Delete any existing code and paste this entire script.
// 4. Click Deploy > New Deployment.
// 5. Select Type: "Web app".
// 6. Set "Execute as": Me.
// 7. Set "Who has access": Anyone.
// 8. Click Deploy, authorize permissions, and copy the Web App URL.
// 9. Paste that URL in src/pages/Login.jsx, src/pages/ProductDetail.jsx, and src/pages/Checkout.jsx.
// ====================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "";
    var ss;
    try {
      ss = SpreadsheetApp.openById("1z3bAQFb7huVtLc6x1bcuqQZMIBcCx7fYcHyG8iTPxkk");
    } catch (err) {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
    
    // ACTION 1: USER SIGNUP OR LOGIN
    if (action === "signup" || action === "login") {
      var sheet = ss.getSheetByName("Users");
      if (!sheet) {
        sheet = ss.insertSheet("Users");
        sheet.appendRow(["Timestamp", "Action", "Name", "Email", "Phone", "Password"]);
      }
      
      sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        action,
        data.name || "",
        data.email || "",
        data.phone || "",
        data.password || ""
      ]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", message: "User recorded" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ACTION 2: T-SHIRT CUSTOMIZATION (IMAGE UPLOAD)
    else if (action === "customize") {
      var sheet = ss.getSheetByName("Customizations");
      if (!sheet) {
        sheet = ss.insertSheet("Customizations");
        sheet.appendRow(["Timestamp", "Name", "Product", "Size", "Color", "Image Link"]);
      }
      
      var imageUrl = "No Image Uploaded";
      
      // Attempt to save to Google Drive if base64 data is present
      if (data.imageData && data.imageData.indexOf("data:") === 0) {
        try {
          // Find or create public customizations folder
          var folders = DriveApp.getFoldersByName("ArcticFoxCustomizations");
          var folder;
          if (folders.hasNext()) {
            folder = folders.next();
          } else {
            folder = DriveApp.createFolder("ArcticFoxCustomizations");
          }
          
          // Parse content type & base64 characters
          var mimeType = data.imageData.substring(data.imageData.indexOf(":") + 1, data.imageData.indexOf(";"));
          var base64Data = data.imageData.substring(data.imageData.indexOf(",") + 1);
          var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, "custom_" + (data.name || "user") + "_" + new Date().getTime());
          
          var file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
          imageUrl = file.getUrl();
        } catch (driveErr) {
          // If Drive API throws permissions or other error, fallback to shortened string
          imageUrl = "Drive Fallback: " + data.imageData.substring(0, 200) + "...";
        }
      } else if (data.imageData) {
        imageUrl = data.imageData; // direct link or backup string
      }
      
      sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.name || "Anonymous",
        data.productName || "Generic T-Shirt",
        data.size || "M",
        data.color || "Default",
        imageUrl
      ]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", message: "Customization saved", imageUrl: imageUrl }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ACTION 3: PLACE TRANSACTION ORDER
    else if (action === "place_order") {
      var sheet = ss.getSheetByName("Orders");
      if (!sheet) {
        sheet = ss.insertSheet("Orders");
        sheet.appendRow(["Timestamp", "Order ID", "Name", "Email", "Phone", "Address", "Payment Method", "Items", "Total Amount"]);
      }
      
      // format items array as human readable list
      var formattedItems = "";
      if (Array.isArray(data.items)) {
        formattedItems = data.items.map(function(item) {
          var details = item.name + " (" + item.size + ", " + item.color + ") x" + item.quantity;
          if (item.customization) {
            details += " [Customized for " + (item.customization.name || "User") + "]";
          }
          return details;
        }).join(" | ");
      } else if (data.items) {
        formattedItems = JSON.stringify(data.items);
      }
      
      sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.orderId || "",
        data.name || "",
        data.email || "",
        data.phone || "",
        data.address || "",
        data.paymentMethod || "COD",
        formattedItems,
        "INR " + (data.totalAmount || 0)
      ]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", message: "Order placed successfully" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Unknown Action
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: "Invalid action" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Arctic Fox Multi-Sheet API is active" }))
    .setMimeType(ContentService.MimeType.JSON);
}
