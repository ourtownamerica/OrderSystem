import { motion } from "framer-motion";

export default function Page({ children }) {
	return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:1.3}} className="flex-fill-v">{children}</motion.div>;
}