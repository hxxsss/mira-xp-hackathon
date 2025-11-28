"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

// Import character images
import macacoImg from "@/assets/characters/macaco.png";
import ursaImg from "@/assets/characters/ursa.png";
import leaoImg from "@/assets/characters/leao.png";
import coelhaImg from "@/assets/characters/coelha.png";

interface Avatar {
  id: number;
  img: string;
  alt: string;
  name: string;
}

// Full body character images
import rickyFullBody from "@/assets/characters/ricky-fullbody.png";
import milaFullBody from "@/assets/characters/mila-fullbody.png";
import aleFullBody from "@/assets/characters/ale-fullbody.png";
import trixFullBody from "@/assets/characters/trix-fullbody.png";

export const avatars: Avatar[] = [
  {
    id: 1,
    img: macacoImg,
    alt: "Ricky",
    name: "Ricky",
  },
  {
    id: 2,
    img: ursaImg,
    alt: "Mila",
    name: "Mila",
  },
  {
    id: 3,
    img: leaoImg,
    alt: "Ale",
    name: "Ale",
  },
  {
    id: 4,
    img: coelhaImg,
    alt: "Trix",
    name: "Trix",
  },
];

export const fullBodyAvatars = [
  {
    id: 1,
    img: rickyFullBody,
    alt: "Ricky",
    name: "Ricky",
  },
  {
    id: 2,
    img: milaFullBody,
    alt: "Mila",
    name: "Mila",
  },
  {
    id: 3,
    img: aleFullBody,
    alt: "Ale",
    name: "Ale",
  },
  {
    id: 4,
    img: trixFullBody,
    alt: "Trix",
    name: "Trix",
  },
];

const mainAvatarVariants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const pickerVariants = {
  container: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    initial: {
      y: 20,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
      },
    },
  },
};

const selectedVariants = {
  initial: {
    opacity: 0,
    rotate: -180,
  },
  animate: {
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    rotate: 180,
    transition: {
      duration: 0.2,
    },
  },
};

interface AvatarPickerProps {
  selectedAvatarId: number;
  onAvatarChange: (avatarId: number) => void;
}

export function AvatarPicker({ selectedAvatarId, onAvatarChange }: AvatarPickerProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(
    avatars.find((a) => a.id === selectedAvatarId) || avatars[0]
  );
  const [rotationCount, setRotationCount] = useState(0);

  useEffect(() => {
    const avatar = avatars.find((a) => a.id === selectedAvatarId);
    if (avatar) {
      setSelectedAvatar(avatar);
    }
  }, [selectedAvatarId]);

  const handleAvatarSelect = (avatar: Avatar) => {
    setRotationCount((prev) => prev + 1080);
    setSelectedAvatar(avatar);
    onAvatarChange(avatar.id);
  };

  return (
    <motion.div initial="initial" animate="animate" className="w-full">
      <Card className="w-full mx-auto overflow-hidden bg-gradient-to-b from-background to-muted/30 border-none shadow-none">
        <CardContent className="p-0">
          {/* Background header */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "6rem",
              transition: {
                height: {
                  type: "spring" as const,
                  stiffness: 100,
                  damping: 20,
                },
              },
            }}
            className="bg-gradient-to-r from-primary/20 to-accent/10 w-full"
          />

          <div className="px-6 pb-6 -mt-12">
            {/* Main avatar display */}
            <motion.div
              className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-background bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center shadow-lg"
              variants={mainAvatarVariants}
              layoutId="selectedAvatar"
            >
              <motion.img
                src={selectedAvatar.img}
                alt={selectedAvatar.alt}
                className="w-full h-full object-cover"
                animate={{
                  rotate: rotationCount,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            </motion.div>

            {/* Character name */}
            <motion.div
              className="text-center mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-lg font-semibold text-foreground">
                {selectedAvatar.name}
              </p>
            </motion.div>

            {/* Avatar selection */}
            <motion.div
              className="mt-6"
              variants={pickerVariants.container}
            >
              <motion.div
                className="grid grid-cols-4 gap-3 max-w-xs mx-auto"
                variants={pickerVariants.container}
              >
                {avatars.map((avatar) => (
                  <motion.button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={cn(
                      "relative aspect-square rounded-full overflow-hidden border-2 bg-gradient-to-br from-cyan-100 to-cyan-50",
                      "transition-all duration-300"
                    )}
                    variants={pickerVariants.item}
                    whileHover={{
                      y: -2,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{
                      y: 0,
                      transition: { duration: 0.2 },
                    }}
                    aria-label={`Selecionar ${avatar.alt}`}
                    aria-pressed={selectedAvatar.id === avatar.id}
                  >
                    <img
                      src={avatar.img}
                      alt={avatar.alt}
                      className="w-full h-full object-cover"
                    />
                    {selectedAvatar.id === avatar.id && (
                      <motion.div
                        className="absolute inset-0 bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full"
                        variants={selectedVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layoutId="selectedIndicator"
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
