
import { useEffect, useRef, useState } from 'react';
import StudentCard from './StudentCard';
import { searchUser } from '../../../api/userApi';

export default function SearchList({ searchQuery, filters }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef();

  // Reset when query or filters change
  useEffect(() => {
    setStudents([]);
    setPage(0);
    setHasMore(true);
  }, [searchQuery, filters]);

  // Fetch data on page, search, or filters change
  useEffect(() => {
    const fetchStudents = async () => {
      if (!hasMore && page !== 0) return;

      setLoading(true);
      try {
        const res = await searchUser({
          search: searchQuery,
          university: filters.university === "all" ? null : filters.university,
          course: filters.course === "all" ? null : filters.course,
          skills: filters.skills,
          page: page,
          size: 2,
        });

        if (res.status === 200) {
          setStudents(prev => [...prev, ...res.data.content]);
          setHasMore(!res.data.last); // important fix
          console.log("students loaded", page, hasMore, res.data.content);
        } else {
          console.log("Error while fetching user search info");
        }
      } catch (e) {
        console.log("Error while searching user", e);
      } finally {
        setLoading(false);
      }
    };


    const timeout = setTimeout(() => {
      fetchStudents();
    }, 1000);

    return () => {
      clearTimeout(timeout);
    }

  }, [page, searchQuery, filters]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && students.length !== 0) {
        setPage(prev => prev + 1);
      }
    }, {
      root: null,
      threshold: 1.0,
    });

    const current = loaderRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, students]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map(student => (
        <StudentCard key={student.user.id} student={student.user} status={student.status} />
      ))}
      {/* The invisible loader that triggers scroll */}
      <div ref={loaderRef} className="h-10"></div>
      {loading && <div className="text-white col-span-full text-center">Loading...</div>}
    </div>
  );
}
