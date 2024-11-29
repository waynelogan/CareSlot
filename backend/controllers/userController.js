// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import validator from "validator";
// import userModel from "../models/userModel.js";
// import doctorModel from "../models/doctorModel.js";
// import appointmentModel from "../models/appointmentModel.js";
// import { v2 as cloudinary } from 'cloudinary';
// // import stripeModule from "stripe";
// // import Razorpay from 'razorpay';

// // Gateway Initialize
// // const stripeInstance = stripeModule(process.env.STRIPE_SECRET_KEY);
// // const razorpayInstance = new Razorpay({
// //   key_id: process.env.RAZORPAY_KEY_ID,
// //   key_secret: process.env.RAZORPAY_KEY_SECRET,
// // });

// // API to register user
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Checking for all data to register user
//     if (!name || !email || !password) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     // Validating email format
//     if (!validator.isEmail(email)) {
//       return res.status(400).json({ success: false, message: 'Please enter a valid email' });
//     }

//     // Validating password strength
//     if (password.length < 8) {
//       return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
//     }

//     // Check if the user already exists
//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ success: false, message: 'User already exists with this email' });
//     }

//     // Hashing user password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const userData = {
//       name,
//       email,
//       password: hashedPassword,
//     };

//     const newUser = new userModel(userData);
//     const user = await newUser.save();

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.status(201).json({ success: true, token, message: 'User registered successfully' });
//   } catch (error) {
//     console.error('Error in registerUser:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // API to login user
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Email and password are required' });
//     }

//     // Find user by email
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.json({ success: true, token, message: 'Login successful' });
//   } catch (error) {
//     console.error('Error in loginUser:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // API to get user profile data
// const getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userData = await userModel.findById(userId).select('-password');

//     res.json({ success: true, userData });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // API to update user profile
// const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { name, phone, address, dob, gender } = req.body;
//     const imageFile = req.file;

//     if (!name || !phone || !dob || !gender) {
//       return res.status(400).json({ success: false, message: "Data Missing" });
//     }

//     await userModel.findByIdAndUpdate(userId, {
//       name,
//       phone,
//       address: JSON.parse(address),
//       dob,
//       gender,
//     });

//     if (imageFile) {
//       // Upload image to cloudinary
//       const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
//         resource_type: "image",
//       });
//       const imageURL = imageUpload.secure_url;

//       await userModel.findByIdAndUpdate(userId, { image: imageURL });
//     }

//     res.json({ success: true, message: 'Profile Updated' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // API to book appointment
// const bookAppointment = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { docId, slotDate, slotTime } = req.body;
//     const docData = await doctorModel.findById(docId).select("-password");

//     if (!docData || !docData.available) {
//       return res.json({ success: false, message: 'Doctor Not Available' });
//     }

//     let slots_booked = docData.slots_booked || {};

//     // Checking for slot availability
//     if (slots_booked[slotDate]) {
//       if (slots_booked[slotDate].includes(slotTime)) {
//         return res.json({ success: false, message: 'Slot Not Available' });
//       } else {
//         slots_booked[slotDate].push(slotTime);
//       }
//     } else {
//       slots_booked[slotDate] = [slotTime];
//     }

//     const appointmentData = {
//       userId,
//       docId,
//       amount: docData.fees,
//       slotTime,
//       slotDate,
//       date: Date.now(),
//     };

//     const newAppointment = new appointmentModel(appointmentData);
//     await newAppointment.save();

//     // Save new slots data in docData
//     await doctorModel.findByIdAndUpdate(docId, { slots_booked });

//     res.json({ success: true, message: 'Appointment Booked' });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to cancel appointment
// const cancelAppointment = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { appointmentId } = req.body;
//     const appointmentData = await appointmentModel.findById(appointmentId);

//     // Verify appointment exists and belongs to the user
//     if (!appointmentData || appointmentData.userId.toString() !== userId) {
//       return res.status(401).json({ success: false, message: 'Unauthorized action' });
//     }

//     // Update the appointment as cancelled
//     await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

//     // Release the doctor's slot
//     const { docId, slotDate, slotTime } = appointmentData;
//     const doctorData = await doctorModel.findById(docId);
//     let slots_booked = doctorData.slots_booked;

//     if (slots_booked && slots_booked[slotDate]) {
//       slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);

//       // If no more slots on that date, remove the date entry
//       if (slots_booked[slotDate].length === 0) {
//         delete slots_booked[slotDate];
//       }

//       await doctorModel.findByIdAndUpdate(docId, { slots_booked });
//     }

//     res.json({ success: true, message: 'Appointment Cancelled' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // API to get user appointments for frontend Myappointments page
// const listAppointment = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const appointments = await appointmentModel.find({ userId })
//       .populate('docId', 'name speciality image address');

//     res.json({ success: true, appointments });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // // API to make payment of appointment using Razorpay
// // const paymentRazorpay = async (req, res) => {
// //   try {
// //     const { appointmentId } = req.body;
// //     const appointmentData = await appointmentModel.findById(appointmentId);

// //     if (!appointmentData || appointmentData.cancelled) {
// //       return res.json({ success: false, message: 'Appointment Cancelled or not found' });
// //     }

// //     // Creating options for Razorpay payment
// //     const options = {
// //       amount: appointmentData.amount * 100,
// //       currency: process.env.CURRENCY,
// //       receipt: appointmentId,
// //     };

// //     // Creation of an order
// //     const order = await razorpayInstance.orders.create(options);

// //     res.json({ success: true, order });
// //   } catch (error) {
// //     console.error(error);
// //     res.json({ success: false, message: error.message });
// //   }
// // };

// // // API to verify payment of Razorpay
// // const verifyRazorpay = async (req, res) => {
// //   try {
// //     const { razorpay_order_id } = req.body;
// //     const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

// //     if (orderInfo.status === 'paid') {
// //       await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
// //       res.json({ success: true, message: "Payment Successful" });
// //     } else {
// //       res.json({ success: false, message: 'Payment Failed' });
// //     }
// //   } catch (error) {
// //     console.error(error);
// //     res.json({ success: false, message: error.message });
// //   }
// // };

// // // API to make payment of appointment using Stripe
// // const paymentStripe = async (req, res) => {
// //   try {
// //     const { appointmentId } = req.body;
// //     const { origin } = req.headers;

// //     const appointmentData = await appointmentModel.findById(appointmentId);

// //     if (!appointmentData || appointmentData.cancelled) {
// //       return res.json({ success: false, message: 'Appointment Cancelled or not found' });
// //     }

// //     const currency = process.env.CURRENCY.toLowerCase();

// //     const line_items = [
// //       {
// //         price_data: {
// //           currency,
// //           product_data: {
// //             name: "Appointment Fees",
// //           },
// //           unit_amount: appointmentData.amount * 100,
// //         },
// //         quantity: 1,
// //       },
// //     ];

// //     const session = await stripeInstance.checkout.sessions.create({
// //       success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
// //       cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
// //       line_items: line_items,
// //       mode: 'payment',
// //     });

// //     res.json({ success: true, session_url: session.url });
// //   } catch (error) {
// //     console.error(error);
// //     res.json({ success: false, message: error.message });
// //   }
// // };

// // const verifyStripe = async (req, res) => {
// //   try {
// //     const { appointmentId, success } = req.body;

// //     if (success === "true") {
// //       await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
// //       return res.json({ success: true, message: 'Payment Successful' });
// //     }

// //     res.json({ success: false, message: 'Payment Failed' });
// //   } catch (error) {
// //     console.error(error);
// //     res.json({ success: false, message: error.message });
// //   }
// // };

// // API to get user dashboard data
// const getDashboardData = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Get all appointments for the user
//     const appointments = await appointmentModel.find({ userId });

//     const totalAppointments = appointments.length;

//     let upcomingAppointments = 0;
//     let completedAppointments = 0;
//     let cancelledAppointments = 0;

//     // Today's date
//     const today = new Date();

//     // Function to parse slotDate string into Date object
//     const parseSlotDate = (slotDateStr) => {
//       const [day, month, year] = slotDateStr.split('_');
//       return new Date(`${year}-${month}-${day}`);
//     };

//     // Iterate over appointments to calculate counts
//     appointments.forEach((appointment) => {
//       if (appointment.cancelled) {
//         cancelledAppointments += 1;
//       } else if (appointment.isCompleted) {
//         completedAppointments += 1;
//       } else {
//         const appointmentDate = parseSlotDate(appointment.slotDate);
//         if (appointmentDate >= today) {
//           upcomingAppointments += 1;
//         }
//       }
//     });

//     // Get latest appointments, sorted by creation date
//     const latestAppointments = await appointmentModel
//       .find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .populate('docId', 'name speciality image');

//     res.json({
//       success: true,
//       totalAppointments,
//       upcomingAppointments,
//       completedAppointments,
//       cancelledAppointments,
//       latestAppointments,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

// export {
//   loginUser,
//   registerUser,
//   getProfile,
//   updateProfile,
//   bookAppointment,
//   listAppointment,
//   cancelAppointment,
//   paymentRazorpay,
//   verifyRazorpay,
//   paymentStripe,
//   verifyStripe,
//   getDashboardData,
// };



// Below is the coed commented on 21st November.
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import validator from "validator";
// import userModel from "../models/userModel.js";
// import doctorModel from "../models/doctorModel.js";
// import appointmentModel from "../models/appointmentModel.js";
// import { v2 as cloudinary } from 'cloudinary';
// // import stripe from "stripe";
// // import razorpay from 'razorpay';

// // Gateway Initialize
// const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
// const razorpayInstance = new razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // API to register user
// const registerUser = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
    
//         // Checking for all data to register user
//         if (!name || !email || !password) {
//           return res.status(400).json({ success: false, message: 'Missing required fields' });
//         }
    
//         // Validating email format
//         if (!validator.isEmail(email)) {
//           return res.status(400).json({ success: false, message: 'Please enter a valid email' });
//         }
    
//         // Validating password strength
//         if (password.length < 8) {
//           return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
//         }
    
//         // Check if the user already exists
//         const existingUser = await userModel.findOne({ email });
//         if (existingUser) {
//           return res.status(409).json({ success: false, message: 'User already exists with this email' });
//         }
    
//         // Hashing user password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
    
//         const userData = {
//           name,
//           email,
//           password: hashedPassword,
//         };
//         const newUser = new userModel(userData);
//     const user = await newUser.save();

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.status(201).json({ success: true, token, message: 'User registered successfully' });
//   } catch (error) {
//     console.error('Error in registerUser:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // API to login user
// const loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;
    
//         // Validate input
//         if (!email || !password) {
//           return res.status(400).json({ success: false, message: 'Email and password are required' });
//         }
    
//         // Find user by email
//         const user = await userModel.findOne({ email });
//         if (!user) {
//           return res.status(401).json({ success: false, message: 'Invalid email or password' });
//         }
    
//         // Compare password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//           return res.status(401).json({ success: false, message: 'Invalid email or password' });
//         }
    
//         // Generate JWT token
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
//         res.json({ success: true, token, message: 'Login successful' });
//       } catch (error) {
//         console.error('Error in loginUser:', error);
//         res.status(500).json({ success: false, message: 'Server error' });
//       }

// };

// // API to get user profile data
// const getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // Changed from req.body.userId to req.user.id
//     const userData = await userModel.findById(userId).select('-password');

//     res.json({ success: true, userData });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to update user profile
// const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // Changed from req.body.userId to req.user.id
//     const { name, phone, address, dob, gender } = req.body;
//     const imageFile = req.file;

//     if (!name || !phone || !dob || !gender) {
//       return res.json({ success: false, message: "Data Missing" });
//     }

//     await userModel.findByIdAndUpdate(userId, {
//       name,
//       phone,
//       address: JSON.parse(address),
//       dob,
//       gender,
//     });

//     if (imageFile) {
//       // upload image to cloudinary
//       const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
//         resource_type: "image",
//       });
//       const imageURL = imageUpload.secure_url;

//       await userModel.findByIdAndUpdate(userId, { image: imageURL });
//     }

//     res.json({ success: true, message: 'Profile Updated' });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to book appointment
// const bookAppointment = async (req, res) => {
//   try {
//     const userId = req.user.id; // Changed from req.body.userId to req.user.id
//     const { docId, slotDate, slotTime } = req.body;
//     const docData = await doctorModel.findById(docId).select("-password");

//     if (!docData.available) {
//       return res.json({ success: false, message: 'Doctor Not Available' });
//     }

//     let slots_booked = docData.slots_booked || {};

//     // checking for slot availability
//     if (slots_booked[slotDate]) {
//       if (slots_booked[slotDate].includes(slotTime)) {
//         return res.json({ success: false, message: 'Slot Not Available' });
//       } else {
//         slots_booked[slotDate].push(slotTime);
//       }
//     } else {
//       slots_booked[slotDate] = [slotTime];
//     }

//     const userData = await userModel.findById(userId).select("-password");

//     delete docData.slots_booked;

//     const appointmentData = {
//       userId,
//       docId,
//       userData,
//       docData,
//       amount: docData.fees,
//       slotTime,
//       slotDate,
//       date: Date.now(),
//     };

//     const newAppointment = new appointmentModel(appointmentData);
//     await newAppointment.save();

//     // save new slots data in docData
//     await doctorModel.findByIdAndUpdate(docId, { slots_booked });

//     res.json({ success: true, message: 'Appointment Booked' });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

  

// // API to cancel appointment
// const cancelAppointment = async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const { appointmentId } = req.body;
//       const appointmentData = await appointmentModel.findById(appointmentId);
  
//       // Verify appointment exists and belongs to the user
//       if (!appointmentData || appointmentData.userId.toString() !== userId) {
//         return res.status(401).json({ success: false, message: 'Unauthorized action' });
//       }
  
//       // Update the appointment as cancelled
//       await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
  
//       // Release the doctor's slot
//       const { docId, slotDate, slotTime } = appointmentData;
//       const doctorData = await doctorModel.findById(docId);
//       let slots_booked = doctorData.slots_booked;
  
//       if (slots_booked && slots_booked[slotDate]) {
//         slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);
  
//         // If no more slots on that date, remove the date entry
//         if (slots_booked[slotDate].length === 0) {
//           delete slots_booked[slotDate];
//         }
  
//         await doctorModel.findByIdAndUpdate(docId, { slots_booked });
//       }
  
//       res.json({ success: true, message: 'Appointment Cancelled' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   };
  
  
//     // // verify appointment user
//     // if (appointmentData.userId.toString() !== userId) {
//     //   return res.json({ success: false, message: 'Unauthorized action' });
//     // }

//     // await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

// //     // releasing doctor slot
// //     const { docId, slotDate, slotTime } = appointmentData;

// //     const doctorData = await doctorModel.findById(docId);

// //     let slots_booked = doctorData.slots_booked;

// //     slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);

// //     await doctorModel.findByIdAndUpdate(docId, { slots_booked });

// //     res.json({ success: true, message: 'Appointment Cancelled' });
// //    }   catch (error) {
// //     console.log(error);
// //     res.json({ success: false, message: error.message });
// //   }
// // ;

// // API to get user appointments for frontend my-appointments page
// const listAppointment = async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const appointments = await appointmentModel.find({ userId })
//         .populate('docId', 'name speciality image address');
  
//       res.json({ success: true, appointments });
//     } catch (error) {
//       console.log(error);
//       res.json({ success: false, message: error.message });
//     }
//   };

// // API to make payment of appointment using razorpay
// const paymentRazorpay = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;
//     const appointmentData = await appointmentModel.findById(appointmentId);

//     if (!appointmentData || appointmentData.cancelled) {
//       return res.json({ success: false, message: 'Appointment Cancelled or not found' });
//     }

//     // creating options for razorpay payment
//     const options = {
//       amount: appointmentData.amount * 100,
//       currency: process.env.CURRENCY,
//       receipt: appointmentId,
//     };

//     // creation of an order
//     const order = await razorpayInstance.orders.create(options);

//     res.json({ success: true, order });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to verify payment of razorpay
// const verifyRazorpay = async (req, res) => {
//   try {
//     const { razorpay_order_id } = req.body;
//     const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

//     if (orderInfo.status === 'paid') {
//       await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       res.json({ success: false, message: 'Payment Failed' });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to make payment of appointment using Stripe
// const paymentStripe = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;
//     const { origin } = req.headers;

//     const appointmentData = await appointmentModel.findById(appointmentId);

//     if (!appointmentData || appointmentData.cancelled) {
//       return res.json({ success: false, message: 'Appointment Cancelled or not found' });
//     }

//     const currency = process.env.CURRENCY.toLowerCase();

//     const line_items = [
//       {
//         price_data: {
//           currency,
//           product_data: {
//             name: "Appointment Fees",
//           },
//           unit_amount: appointmentData.amount * 100,
//         },
//         quantity: 1,
//       },
//     ];

//     const session = await stripeInstance.checkout.sessions.create({
//       success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
//       cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
//       line_items: line_items,
//       mode: 'payment',
//     });

//     res.json({ success: true, session_url: session.url });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// const verifyStripe = async (req, res) => {
//   try {
//     const { appointmentId, success } = req.body;

//     if (success === "true") {
//       await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
//       return res.json({ success: true, message: 'Payment Successful' });
//     }

//     res.json({ success: false, message: 'Payment Failed' });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to get user dashboard data
// const getDashboardData = async (req, res) => {
//   try {
//     const userId = req.user.id; // Use userId from req.user

//     // Get all appointments for the user
//     const appointments = await appointmentModel.find({ userId });

//     const totalAppointments = appointments.length;

//     let upcomingAppointments = 0;
//     let completedAppointments = 0;
//     let cancelledAppointments = 0;

//     // Today's date
//     const today = new Date();

//     // Function to parse slotDate string into Date object
//     const parseSlotDate = (slotDateStr) => {
//       const [day, month, year] = slotDateStr.split('_');
//       return new Date(`${year}-${month}-${day}`);
//     };

//     // Iterate over appointments to calculate counts
//     appointments.forEach((appointment) => {
//       if (appointment.cancelled) {
//         cancelledAppointments += 1;
//       } else if (appointment.isCompleted) {
//         completedAppointments += 1;
//       } else {
//         const appointmentDate = parseSlotDate(appointment.slotDate);
//         if (appointmentDate >= today) {
//           upcomingAppointments += 1;
//         }
//       }
//     });

//     // Get latest appointments, sorted by creation date
//     const latestAppointments = await appointmentModel
//       .find({ userId })
//       .sort({ createdAt: -1 }) // Ensure timestamps are enabled in your schema
//       .limit(5)
//       .populate('docId', 'name speciality image'); // Assuming docId refers to Doctor model

//     res.json({
//       success: true,
//       "totalAppointments": 5,
//       "upcomingAppointments": 2,
//       "completedAppointments": 2,
//       "cancelledAppointments": 1,
//       "latestAppointments": [

//       ],
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

// export {
//   loginUser,
//   registerUser,
//   getProfile,
//   updateProfile,
//   bookAppointment,
//   listAppointment,
//   cancelAppointment,
//   paymentRazorpay,
//   verifyRazorpay,
//   paymentStripe,
//   verifyStripe,
//   getDashboardData, // Added the new function to exports
// };



import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
// import stripe from "stripe";
// import razorpay from 'razorpay';

// Gateway Initialize
// const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
// const razorpayInstance = new razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// })

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const { origin } = req.headers

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Appointment Fees"
                },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { appointmentId, success } = req.body

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            return res.json({ success: true, message: 'Payment Successful' })
        }

        res.json({ success: false, message: 'Payment Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe
}