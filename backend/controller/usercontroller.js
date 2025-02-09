import UserModel from '../models/usermodel.js';
import bcrypt from 'bcrypt';
import uploadoncloudinary from '../util/cloudinary.js';
import jwt from 'jsonwebtoken';
import usermodel from '../models/usermodel.js';

const registerUser = async (req, res) => {
  const { username, fullname, email, password } = req.body;

  // Basic validation
  if (!username || !fullname || !password || !email) {
    return res.status(400).send('All fields are required');
  }

  try {
    const newPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({
      username,
      fullname,
      email,
      password: newPassword
    });

    await user.save();
    res.send(user);
    console.log(email, password, fullname);
  } catch (err) {
    res.status(500).send('Error registering user');
    console.error(err);
  }
};

const Loginuser = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation


  try {
    if (!email || !password) {
      return res.status(400).send('All fields are required');
    }
    const user = await UserModel.findOne({ email }).populate("post");

    if (!user) {
      return res.status(400).send('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    const token = jwt.sign({ _id: user._id }, 'kY8h2fT7xvB3jW9nPm6zLqD5rA1sXoV4cUeNtHy2gJkZpM7vD', { expiresIn:"1d" });
  
  
    res.status(200).cookie('accesstoken', token, {
     // 15 minutes
      httpOnly:true, // make the cookie visible in the browser
      secure: true, // Only set to true in production
      sameSite: 'None'  // set the same-site flag
    }).send(user);

    if (!isMatch) {
      return res.status(400).send('Invalid email or password');
    }

  
  } catch (err) {
    res.status(500).send('Error logging in user');
    console.error(err);
  }
};

const profileimage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const localAvatarPath = req.file.path;
  console.log(localAvatarPath);

  try {
    const avatar = await uploadoncloudinary(localAvatarPath);

    const user= await UserModel.findByIdAndUpdate(req.user._id, {
      $set: {
        avatar: avatar 
      }
      
    })
   await user.save()
   

    console.log(req.user._id);
    return res.status(200).send(user);
  } catch (err) {
    res.status(500).send('Error uploading avatar');
    console.error(err);
  }
};


const userpost=async(req,res)=>{
  const user=await usermodel.findById(req.user._id).populate("post").select("-password ")
 
  return res.send(user)

}

const logoutuser = (req, res) => {
  console.log('Logout request received');

  return res.status(200)
    .clearCookie('accesstoken', {
      httpOnly:true, // make the cookie visible in the browser
      secure: true, // Only set to true in production
      sameSite: 'None' 
    })  
    .json({ message: 'Logged out successfully' });
 
};




export { registerUser, Loginuser, profileimage,userpost,logoutuser };
