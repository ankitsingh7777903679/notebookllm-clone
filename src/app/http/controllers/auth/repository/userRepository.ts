// import { User } from "@/app/models/userSchema";
import { generateTokens, signAccessToken, signRefreshToken } from "@/app/helpers/jwt";
import { User } from "@/app/models/userSchema";
import { GoogleUserType } from "@/types/user-types";
import { promise } from "zod";

export class UserRepository {
    private static instance: UserRepository;



    public static getInstance(): UserRepository {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;

    }

    async createUser(userprops: GoogleUserType, token: { accessToken: string, refreshToken: string }) {

        // name: { Itype: String, required: false },
        // email: { type: String, required: true, unique: true },
        // image: { type: String, required: false },
        // googleAccessToken: { type: String, required: false },
        // googleRefreshToken: { type: String, required: false },
        // googleId: { type: String, required: true }
        const { sub: id, name, picture, email } = userprops?._json;

        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            const user = new User({
                name: name,
                email: email,
                image: picture,
                googleAccessToken: token?.accessToken,
                googleRefreshToken: token?.refreshToken,
                googleId: id
            })
            const newUser = await user.save();

            const { accessToken, refreshToken } = await generateTokens(newUser._id);

            return {
                authData: {
                    ...newUser.toObject(),token:{accessToken, refreshToken}
                }
            }
        }else{
            const { accessToken, refreshToken } = await generateTokens(existingUser._id);
            return {
                authData: {
                    ...existingUser.toObject(),token:{accessToken, refreshToken}
                }
            }
        }


    }

}