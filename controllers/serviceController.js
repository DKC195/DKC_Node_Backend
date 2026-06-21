const serviceModel = require("../models/serviceModel");

// Create a new service
exports.createService = async (req, res) => {
  try {
    const { icon, title, description } = req.body;
    const newService = new serviceModel({ icon, title, description });
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get all services
exports.getServices = async (req, res) => {
  try {
    const services = await serviceModel.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { icon, title, description } = req.body;
    const updatedService = await serviceModel.findByIdAndUpdate(
      id,
      { icon, title, description },
      { new: true }
    );
    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await serviceModel.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};