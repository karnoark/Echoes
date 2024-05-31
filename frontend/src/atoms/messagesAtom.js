import {atom} from "recoil"

export const conversationsAtom = atom({
    key: "conversationAtom",
    default: []
})

export const selectedConversationAtom = atom({
    key: "selectedConversationAtom",
    default: {
        _id: "",
        userid: "",
        username: "",
        userProfilePic: "",
    }
})

// export const displayConversationAtom = atom({
//     key: "displayConversationAtom",
//     default: [],
// })