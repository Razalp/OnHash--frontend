import { useEffect, useState } from "react";
import SideBar from "../SideBar/SideBar";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faFlag } from '@fortawesome/free-solid-svg-icons';
import Axios from "@/axious/instance";
import { jwtDecode } from "jwt-decode";
// import Story from "./HomeComponets/Story";
import LazyLoad from 'react-lazyload';
import { Button, Spinner } from "react-bootstrap";
import Swal from 'sweetalert2'
import RandomUserSug from "./HomeComponets/RandomUserSug";
import LoadingSpinner from "./LoadingSpinner";
import { Send} from 'lucide-react';
const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [postLikes, setPostLikes] = useState<any>({});
  const [isLiked,setIsLiked] =useState<boolean>()
  console.log(isLiked)
  const [commentText, setCommentText] = useState('');
  const [commentData, SetCommentData] = useState<any>([])
  const [showCommentBox, setShowCommentBox] = useState<{ [postId: string]: boolean }>({});

  const [likeData, SetLikeData] = useState<any[]>([]);
  const [openLikes, setOpenLikes] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');


  const handleOpenLikes = (postId: any) => {
    setOpenLikes(true);
    fetchPostDetails(postId);
  };
  const closeLikes = () => {
    setOpenLikes(false);
  };
    const handleReportWithConfirmation = async (postId:any) => {
      try {
        const token:string|null|any = localStorage.getItem('accessToken');
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.userId;
        const result = await Swal.fire({
          title: 'Report Post',
          html: `
            <select id="swal-select1" class="swal2-select">
              <option value="sexual-content">Sexual Content</option>
              <option value="unnecessary">Unnecessary</option>
              <option value="not-for-child">Not Suitable for Children</option>
              <option value="vulgar">Vulgar Language</option>
              <option value="terror">Terror-related</option>
            </select>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, report it!',
          cancelButtonText: 'No, cancel!',
          reverseButtons: true,
          preConfirm: () => {
            const select = document.getElementById('swal-select1') as HTMLSelectElement;
            const selectedReason = select?.value;
            console.log('Selected Reason:', selectedReason);
          
            if (!selectedReason) {
              Swal.showValidationMessage('Please select a reason');
              return false;
            }
            setSelectedReason(selectedReason); 
            return selectedReason;
          },
          
        });

        if (result.isConfirmed) {
          const selectedReasonValue = selectedReason;
          const response = await Axios.post(`/api/user/report/${postId}`, { userId: userId, reason: selectedReasonValue });

          if (response.status === 200) {
            Swal.fire('Reported!', 'The post has been reported successfully.', 'success');
          } else {
            Swal.fire('Error', 'Failed to report the post. Please try again later.', 'error');
          }
        } else if (result.isDismissed) {
          Swal.fire('Cancelled', 'You did not report the post.', 'info');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'An internal error occurred. Please try again later.', 'error');
      }
    };



  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {     
      navigate('/log-in');
    }
  }, []);



    const fetchPostDetails = async (postId:any) => {
      try {
       
        const token = localStorage.getItem('accessToken');
        if (!token) {
          return;
        }
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.userId;
        if (postId != null) {
          const response = await Axios.get(`/api/user/getPostDetailes/${postId}/${userId}`);
          SetLikeData(response.data.likes);
          SetCommentData(response.data.comments);
          setIsLiked(response.data.hasLiked)
          // const token = localStorage.getItem('accessToken');
        } else {
          return null
        }
      } catch (error) {
        console.error(error);

      }
    };
  

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
          navigate('/log-in');
          return;
        }

        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.userId;

        setLoading(true);
        if(userId!==null){
          const response = await Axios.get(`/api/user/home/${userId}`);
          setPosts(response.data);

        }else{
          return <Spinner/>
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  const handleLike = async (postId: any) => {
    try {
      const token = localStorage.getItem('accessToken');
  
      if (token) {
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.userId;
  

        const response = await Axios.post(`/api/user/likes/${postId}`, { currentUserId: userId });

        console.log(response)
  

        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
        likedPosts[postId] = !likedPosts[postId]; 
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  
        setPostLikes((prevPostLikes: any) => ({
          ...prevPostLikes,
          [postId]: !prevPostLikes[postId],
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    setPostLikes(likedPosts);
  }, []);


  const handleComment = async (postId: any,e:any) => {
    try {

      e.preventDefault();

      const token = localStorage.getItem('accessToken');

      if (token) {
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.userId;

        if (commentText.trim() !== '') {
          const commentResponse = await Axios.post(`/api/user/comments/${postId}`, {
            currentUserId: userId,
            text: commentText,
          });

          const updatedPostWithComment = commentResponse.data;

          SetCommentData((prevComments: any) => [updatedPostWithComment.comment, ...prevComments]);

          setCommentText('');
        }
        if (!commentData[postId]) {
          await fetchPostDetails(postId);
        }
      } else {

      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  const handleComments = async (postId: string) => {
    setShowCommentBox((prevShowCommentBox) => ({
      ...prevShowCommentBox,
      [postId]: !prevShowCommentBox[postId],
    }));
    if (!commentData[postId]) {
      await fetchPostDetails(postId);
    }
  };


  



  return (
    <div className={`bg-black ${posts && posts.length > 0 ? '' : 'min-h-screen'}`}> 
      <SideBar />
      {/* <Story /> */}
      <RandomUserSug/>
      
      <div className="flex justify-center items-center " >
        
        <div className="grid gap-4 ">
       
          {loading ? (
            <LoadingSpinner /> 
          ) : (
            posts && posts.length > 0 ? (
              posts.map((post: any) => (
                <div key={post._id} className="post-container bg-neutral-950 rounded-md p-4 shadow-md text-white h-auto">
                  <div className="flex items-center space-x-4">
                  <Link to={`/SerachUserProfile/${post.user._id}`}>
      <img
        src={`${import.meta.env.VITE_UPLOAD_URL}${post.user.profilePicture}`}
        alt={post.user.username}
        className="rounded-full w-12 h-12 mb-2 object-cover"
      />
    </Link>
                    <h1 className="text-sm font-semibold">{post.user.username}</h1>
                  </div>
                  <div className="flex justify-center mb-4">
                    <LazyLoad>
                      <img
                        src={`${import.meta.env.VITE_UPLOAD_URL}${post.image}`}
                        alt="Post"
                        className="post-image rounded-md object-cover"
                        style={{ width: "400px", height: "470px" }}
                      />
                    </LazyLoad>
                  </div>
                  <h1 className="text-xs" onClick={() => handleOpenLikes(post._id)}>Likes </h1>
                  <br />
                  <div className="post-icons flex justify-between">
                    <div className="flex items-center space-x-3">
                      
                    <button
  onClick={() => handleLike(post._id)}
  className="like-button"
>
  <FontAwesomeIcon
    icon={faHeart}
    className={`icon-button ${postLikes[post._id] ? 'text-red-600' : 'text-white'} hover:animate-bounce`}
    style={{ fontSize: '26px' }}
  />
</button>
<FontAwesomeIcon
  onClick={() => handleComments(post._id)}
  icon={faComment}
  className="icon text-white"
  style={{ fontSize: '26px' }}
/>

                    </div>
                    <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3 relative right-6">
                      <FontAwesomeIcon
                       onClick={()=>handleReportWithConfirmation(post._id)}
                        icon={faFlag}
                        className="icon text-white"
                        style={{ fontSize: '26px' }}
                      />
                    </div>
                      
                    </div>
                  </div>
                  <div>
                  <h1 className="text-white mr-6">
                    </h1>
                  </div>
                  <div>
                  {showCommentBox[post._id] && (
                    <div>
                      <br />
                      <form onSubmit={(e) => handleComment(post._id, e)}>
                      
  <input
    placeholder="Add a comment..."
    value={commentText}
    onChange={(e) => setCommentText(e.target.value)}
    className="w-96 p-2 rounded-md bg-slate-900 focus:border-blue-500"
  />
  <Button variant={"outline"} type="submit" className="px-3 ml-1">
    <Send />
  </Button>

                      </form>
                      <div className="comments-container">
                        <h3 className="text-white mt-4">Comments:</h3>
                        <br />
                        <ul className="space-y-1">
  {commentData.map((comment:any, index:any) => (
    <li key={index} className=" p-2 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <img
            src={`${import.meta.env.VITE_UPLOAD_URL}${comment?.user?.profilePicture}`}
            alt="User Profile"
            className="w-10 h-10 rounded-full mr-4 object-cover"
          />
          <div>
            <span className="font-semibold text-white">{comment?.user?.username}</span>
            <p className="text-gray-300">{comment?.text}</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm">{comment?.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}</p>
      </div>
    </li>
  ))}
</ul>
                      </div>
                    </div>
                  )}
                  </div>
                  
                </div>
              ))
            ) : (
              <p>No posts available.</p>
            )
          )}

        </div>

        {openLikes && (
  <>
    <div onClick={closeLikes} className="fixed inset-0 bg-black opacity-50 w-full h-full" />
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-950 p-4 sm:p-8 rounded shadow-lg z-20 max-w-screen-md w-full sm:w-80">
      <div className="flex justify-end">
        <Button variant="ghost" onClick={closeLikes}>
          X
        </Button>
      </div>
      <div className="text-center">
        <h1 className="text-xl text-white mb-4">likes</h1>
        <div className="text-gray-300 flex flex-col">
          {likeData?.map((likes: any) => (
            <div key={likes._id} className="p-2 sm:p-4 flex w-full sm:w-auto">
              <div className="flex items-center">
                <img
                  src={`${import.meta.env.VITE_UPLOAD_URL}${likes.user.profilePicture}`}
                  alt={`${likes.user.username}'s Profile`}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-2"
                />
                <span className="block">{likes.user.username}</span>
              </div>
             
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
)}

      </div>
    </div>
  );
}

export default Home;
