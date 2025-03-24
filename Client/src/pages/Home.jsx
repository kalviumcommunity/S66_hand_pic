import Navbar from "../components/Navbar";

export default function Home() {
    return (
    <>
        <Navbar/>
        <div className="w-3/4 mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg text-center">    
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Handscape</h2>
        <p className="text-gray-600">
            This project is all about hands – funny, creative, and unique hand pictures! Users can upload their hand photos,
            view other&apos;s submissions, and vote for the best ones. It&apos;s a fun way to celebrate creativity and share interesting hand moments with the community.
        </p>
        </div>
        </>
    );
}
