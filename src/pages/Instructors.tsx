import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Autocomplete from '@mui/material/Autocomplete';
import api, {
  Category,
  TeacherDisciplines,
  Test,
  TestByTeacher,
} from "../services/api";

function Instructors() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [teachersDisciplines, setTeachersDisciplines] = useState<
    TestByTeacher[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructor, setInstructor] = useState<any>(null);
  const [instructorsOption, setInstructorOption] = useState([]);
  const [instructorInputValue, setInstructorInputValue] = useState('');

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByTeacher(token);
      setTeachersDisciplines(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
      const { data: instructorsData } = await api.getAllInstructors(token);
      setInstructorOption(instructorsData.instructors)
    }
    loadPage();
  }, [token]);

  const instructorOptions = instructorsOption?.map((instructor: any, i: any) => {
    return {
      id: i,
      label: instructor.name
    };
  });

  return (
    <>
      <Autocomplete
        sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }}
        value={instructor}
        onChange={(event, newValue: any) => {
          setInstructor(newValue);
        }}
        inputValue={instructorInputValue}
        onInputChange={(event, newInputValue) => {
          setInstructorInputValue(newInputValue);
        }}
        id="controllable-states-disciplines"
        options={instructorOptions}
        renderInput={(params) => <TextField {...params} label="Instrutor" />}
      />
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TeachersDisciplinesAccordions
          categories={categories}
          teachersDisciplines={teachersDisciplines}
          search={instructor}
        />
      </Box>
    </>
  );
}

interface TeachersDisciplinesAccordionsProps {
  teachersDisciplines: TestByTeacher[];
  categories: Category[];
  search: any;
}

function TeachersDisciplinesAccordions({
  categories,
  teachersDisciplines,
  search,
}: TeachersDisciplinesAccordionsProps) {
  const teachers = getUniqueTeachers(teachersDisciplines);

  return (
    <Box sx={{ marginTop: "50px" }}>
      {teachers.map((teacher) => {
        if (search === null) {
          return (
            <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{teacher}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {categories
                  .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
                  .map((category) => (
                    <Categories
                      key={category.id}
                      category={category}
                      teacher={teacher}
                      teachersDisciplines={teachersDisciplines}
                    />
                  ))}
              </AccordionDetails>
            </Accordion>
          )
        }
        if (teacher === search?.label) {
          return (
            <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{teacher}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {categories
                  .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
                  .map((category) => (
                    <Categories
                      key={category.id}
                      category={category}
                      teacher={teacher}
                      teachersDisciplines={teachersDisciplines}
                    />
                  ))}
              </AccordionDetails>
            </Accordion>
          )
        } else {
          return ""
        }
      })}
    </Box>
  );
}

function getUniqueTeachers(teachersDisciplines: TestByTeacher[]) {
  return [
    ...new Set(
      teachersDisciplines.map(
        (teacherDiscipline) => teacherDiscipline.teacher.name
      )
    ),
  ];
}

function doesCategoryHaveTests(
  teacher: string,
  teachersDisciplines: TeacherDisciplines[]
) {
  return (category: Category) =>
    teachersDisciplines.filter(
      (teacherDiscipline) =>
        teacherDiscipline.teacher.name === teacher &&
        testOfThisCategory(teacherDiscipline, category)
    ).length > 0;
}

function testOfThisCategory(
  teacherDiscipline: TeacherDisciplines,
  category: Category
) {
  return teacherDiscipline.tests.some(
    (test) => test.category.id === category.id
  );
}

interface CategoriesProps {
  teachersDisciplines: TeacherDisciplines[];
  category: Category;
  teacher: string;
}

function Categories({
  category,
  teachersDisciplines,
  teacher,
}: CategoriesProps) {
  return (
    <>
      <Box sx={{ marginBottom: "8px" }}>
        <Typography fontWeight="bold">{category.name}</Typography>
        {teachersDisciplines
          .filter(
            (teacherDiscipline) => teacherDiscipline.teacher.name === teacher
          )
          .map((teacherDiscipline) => (
            <Tests
              key={teacherDiscipline.id}
              tests={teacherDiscipline.tests.filter(
                (test) => test.category.id === category.id
              )}
              disciplineName={teacherDiscipline.discipline.name}
            />

          ))}
      </Box>
    </>
  );
}

interface TestsProps {
  disciplineName: string;
  tests: Test[];
}

async function addView(test: any) {
  await api.addView(test.id)
}

function Tests({ tests, disciplineName }: TestsProps) {
  return (
    <>
      {tests.map((test) => (
        <Typography key={test.id} color="#878787">
          <Link
            onClick={() => addView(test)}
            href={test.pdfUrl}
            target="_blank"
            underline="none"
            color="inherit"
          >{`${test.name} (${disciplineName})`}</Link>
          <span> {test.views} visualizações</span>
        </Typography>
      ))}
    </>
  );
}

export default Instructors;
