import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Code, GraduationCap, Newspaper, Sparkles } from "lucide-react";
import { useState } from "react";

const CHAT_TAB_MESSAGE = [
    {
        tabName: "Create",
        icon: <Sparkles className="h-4 w-4"/>,
        messages: [
            "write a short story about a robot learning to play the piano",
            "write a haiku about the ocean",
            "write a joke about a chicken crossing the road",
        ]
    },
    {
        tabName: "Explore",
        icon: <Newspaper className="h-4 w-4"/>,
        messages: [
            "explore the wonders of the universe",
            "discover new recipes for delicious meals",
            "learn about the history of your favorite city",
        ]
    },
    {
        tabName: "Code",
        icon: <Code className="h-4 w-4"/>,
        messages: [
            "write a function to reverse a string in Python",
            "create a simple to-do list application in JavaScript",
            "explain the concept of object-oriented programming in Java",
        ]
    },
    {
        tabName: "Learn",
        icon: <GraduationCap className="h-4 w-4"/>,
        messages: [
            "learn a new programming language",
            "discover the secrets of successful entrepreneurs",
            "explore the latest advancements in science and technology",
        ]

    }
]

const ChatWelcometabs = ({
    userName,
    onMessageSelect
}: {
    userName: string | undefined;
    onMessageSelect: (message: string) => void;
}) => {
    const [activeTab, setActiveTab] = useState(0);


    return (
        <div className="flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-3xl space-y-8">
               <h1 className="text-2xl font-semibold">
                 How can I assist you today, {userName?.slice(0, userName.indexOf(" "))}?
               </h1>

               <div className="flex flex-wrap gap-2 w-full">
                {
                    CHAT_TAB_MESSAGE.map((tab, index) => (
                        <Button
                            key={index}
                            variant={activeTab === index ? "default":"secondary"}
                            onClick={() => setActiveTab(index)}
                            className="w-[110px] justify-start"
                        >
                            {tab.icon}
                            <span className="ml-2">{tab.tabName}</span>
                        </Button>
                    ))
                }
               </div>

               <div className="space-y-3 w-full min-h-[240px]">
                {
                    CHAT_TAB_MESSAGE[activeTab].messages.map((message, index) => (
                        <div key={index}>
                            <button
                                onClick={() => onMessageSelect(message)}
                                className="w-full text-left text-sm text-muted-foreground hover:text-primary transition-colors duration-300 ease-in-out py-2"
                            >
                                {message}
                            </button>
                            {index < CHAT_TAB_MESSAGE[activeTab].messages.length - 1 && (
                                <Separator/>
                            )}
                        </div>
                    ))
                }
               </div>
            </div>
        </div>
    )
}  

export default ChatWelcometabs