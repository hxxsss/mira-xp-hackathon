"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface Avatar {
  id: number;
  svg: React.ReactNode;
  alt: string;
}

export const avatars: Avatar[] = [
  {
    id: 1,
    svg: (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        aria-label="Avatar 1"
      >
        <mask
          id=":r111:"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="36"
          height="36"
        >
          <rect width="36" height="36" rx="72" fill="#FFFFFF" />
        </mask>
        <g mask="url(#:r111:)">
          <rect width="36" height="36" fill="#ff005b" />
          <rect
            x="0"
            y="0"
            width="36"
            height="36"
            transform="translate(9 -5) rotate(219 18 18) scale(1)"
            fill="#ffb238"
            rx="6"
          />
          <g transform="translate(4.5 -4) rotate(9 18 18)">
            <path
              d="M15 19c2 1 4 1 6 0"
              stroke="#000000"
              fill="none"
              strokeLinecap="round"
            />
            <rect
              x="10"
              y="14"
              width="1.5"
              height="2"
              rx="1"
              stroke="none"
              fill="#000000"
            />
            <rect
              x="24"
              y="14"
              width="1.5"
              height="2"
              rx="1"
              stroke="none"
              fill="#000000"
            />
          </g>
        </g>
      </svg>
    ),
    alt: "Avatar 1",
  },
  {
    id: 2,
    svg: (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
      >
        <mask
          id=":R4mrttb:"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="36"
          height="36"
        >
          <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
        </mask>
        <g mask="url(#:R4mrttb:)">
          <rect width="36" height="36" fill="#ff7d10"></rect>
          <rect
            x="0"
            y="0"
            width="36"
            height="36"
            transform="translate(5 -1) rotate(55 18 18) scale(1.1)"
            fill="#0a0310"
            rx="6"
          />
          <g transform="translate(7 -6) rotate(-5 18 18)">
            <path
              d="M15 20c2 1 4 1 6 0"
              stroke="#FFFFFF"
              fill="none"
              strokeLinecap="round"
            />
            <rect
              x="14"
              y="14"
              width="1.5"
              height="2"
              rx="1"
              stroke="none"
              fill="#FFFFFF"
            />
            <rect
              x="20"
              y="14"
              width="1.5"
              height="2"
              rx="1"
              stroke="none"
              fill="#FFFFFF"
            />
          </g>
        </g>
      </svg>
    ),
    alt: "Avatar 2",
  },
  {
    id: 3,
    svg: (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
      >
        <mask
          id=":r11c:"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="36"
          height="36"
        >
          <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
        </mask>
        <g mask="url(#:r11c:)">
          <rect width="36" height="36" fill="#0a0310" />
          <rect
            x="0"
            y="0"
            width="36"
            height="36"
            transform="translate(-3 7) rotate(227 18 18) scale(1.2)"
            fill="#ff005b"
            rx="36"
          />
          <g transform="translate(-3 3.5) rotate(7 18 18)">
            <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#FFFFFF" />
            <rect
              x="12"
              y="14"
              width="1.5"
              height="2"
              rx="1"
              stroke="none"
              fill="#FFFFFF"
            />
            <rect
              x="22"
              y="14"
              width="1.5"
              height="2"
              rx="1"
              stroke="none"
              fill="#FFFFFF"
            />
          </g>
        </g>
      </svg>
    ),
    alt: "Avatar 3",
  },
  {
    id: 4,
    svg: (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
      >
        <mask
          id=":r1gg:"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="36"
          height="36"
        >
          <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
        </mask>
        <g mask="url(#:r1gg:)">
          <rect width="36" height="36" fill="#d8fcb3"></rect>
          <rect
            x="0"
            y="0"
            width="36"
            height="36"
            transform="translate(9 -5) rotate(219 18 18) scale(1)"
            fill="#89fcb3"
            rx="6"
          ></rect>
          <g transform="translate(4.5 -4) rotate(9 18 18)">
            <path
              d="M15 19c2 1 4 1 6 0"
              stroke="#000000"
              fill="none"
              strokeLinecap="round"
            ></path>
            <rect
              x="10"
              y="14"
              width="1.5"
              height="2"
              rx="1"
              stroke="none"
              fill="#000000"
            ></rect>
            <rect
              x="24"
              y="14"
              width="1.5"
              height="2"
              rx="1"
              stroke="none"
              fill="#000000"
            ></rect>
          </g>
        </g>
      </svg>
    ),
    alt: "Avatar 4",
  },
  {
    id: 5,
    svg: (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
      >
        <mask
          id=":r1hh:"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="36"
          height="36"
        >
          <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
        </mask>
        <g mask="url(#:r1hh:)">
          <rect width="36" height="36" fill="#4f46e5"></rect>
          <rect
            x="0"
            y="0"
            width="36"
            height="36"
            transform="translate(-4 4) rotate(184 18 18) scale(1.1)"
            fill="#fbbf24"
            rx="36"
          ></rect>
          <g transform="translate(3.5 -2) rotate(-8 18 18)">
            <path
              d="M13,19 a1,0.75 0 0,0 10,0"
              fill="#000000"
            />
            <rect
              x="11"
              y="14"
              width="1.5"
              height="2"
              rx="1"
              stroke="none"
              fill="#000000"
            />
            <rect
              x="23"
              y="14"
              width="1.5"
              height="2"
              rx="1"
              stroke="none"
              fill="#000000"
            />
          </g>
        </g>
      </svg>
    ),
    alt: "Avatar 5",
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
              className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-background bg-background flex items-center justify-center shadow-lg"
              variants={mainAvatarVariants}
              layoutId="selectedAvatar"
            >
              <motion.div
                className="w-full h-full flex items-center justify-center scale-[3]"
                animate={{
                  rotate: rotationCount,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {selectedAvatar.svg}
              </motion.div>
            </motion.div>

            {/* Avatar selection */}
            <motion.div
              className="mt-6"
              variants={pickerVariants.container}
            >
              <motion.div
                className="flex justify-center gap-3"
                variants={pickerVariants.container}
              >
                {avatars.map((avatar) => (
                  <motion.button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={cn(
                      "relative w-12 h-12 rounded-full overflow-hidden border-2 bg-background",
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
                    aria-label={`Select ${avatar.alt}`}
                    aria-pressed={selectedAvatar.id === avatar.id}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {avatar.svg}
                    </div>
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
