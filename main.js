(() => {

    class StudentManager {
        constructor() {
            this.student = {};
        }
        
        create() {
            let student = {};

            let form = document.querySelector('.students__form');
            let inputs = form.querySelectorAll('input');

            inputs.forEach(input => {
                switch (input.id) {
                    case 'name': student.name = input.value; break;
                    case 'date': student.birthDate = input.valueAsDate; break;
                    case 'year': student.studyStartDate = input.value; break;
                    case 'faculty': student.faculty = input.value; break;
                }
            })

            let [name, surname, middleName] = studentManager.getFIO(student.name);
            student.name = name;
            student.surname = surname;
            student.middleName = middleName;

            return student;
        }

        verify(student) {
            let shouldBeFilled = 'должно быть заполнено';
            if (!student.name) {
                return 'Поле имени ' + shouldBeFilled;
            }

            if (!student.birthDate) {
                return 'Поле даты рождения ' + shouldBeFilled;
            }

            if (!student.studyStartDate) {
                return 'Поле начала даты обучения ' + shouldBeFilled;
            }

            if (!student.faculty) {
                return 'Поле факультета ' + shouldBeFilled;
            }

            let date = new Date;
            if ((student.birthDate.getFullYear() < 1900 || student.birthDate.getFullYear() > date.getFullYear())) {
                return 'Студент слишком стар или еще не родился';
            }

            student.birthDate = studentManager.getBirthDate(student.birthDate);

            if (student.studyStartDate.length != 4 || Number(student.studyStartDate) < 2000) {
                console.log(student.studyStartDate.length);
                console.log(Number(student.studyStartDate) < 2000);
                return 'Некорректная дата начала обучения';
            }

            student.studyStartDate = studentManager.getStudyStartDate(student.studyStartDate);

            return '';
        }

        getFIO(fullname) {
            const [surname, name, middleName] = fullname
                .trim()
                .split(' ')
                .map(str => str.trim())
                .filter(text => text.length > 0)
            return [surname, name, middleName];
        }

        getBirthDate(birthDate) {
            let today = new Date;
    
            let year = birthDate.getFullYear();
            let todayYear = today.getFullYear();
    
            let age = todayYear - year;
    
            today.setFullYear(year); // делаю одинаковые года, чтобы сверить больше или меньше месяц от сегодняшнего месяца
            if (birthDate > today) {
                age -= 1;
            }
    
            let options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            let formattedDate = birthDate.toLocaleDateString('en-GB', options);
            formattedDate = formattedDate.split('/').join('.');
            return `${formattedDate} (${helpers.yearsDeclension(age)})`;
        }

        getStudyStartDate(startDate) {
            let today = new Date;
            let finishDate = Number(startDate) + 4
            let kursYear = today.getFullYear() - startDate;
    
            let kurs = kursYear > 4 ? 'закончил' : `${kursYear} курс`
    
            return `${startDate}-${finishDate} (${kurs})`
        }

        addToStorage(student) {
            let students = helpers.getLocalStorage(LOCAL_STORAGE_KEY);
    
            if (studentManager.isStudentExists(student, students)) {
                return 'already exists';
            }
    
            students.push(student);
    
            helpers.setLocalStorage(LOCAL_STORAGE_KEY, students);
            return 'success';
        }

        isStudentExists(studentToCheck, studentsArray) {
            return studentsArray.some(student => {
                return (
                    student.name === studentToCheck.name &&
                    student.surname === studentToCheck.surname &&
                    student.birthDate === studentToCheck.birthDate
                );
            });
        }

        getAll(students) {
            if (!students) {
                students = helpers.getLocalStorage(LOCAL_STORAGE_KEY);
            }
    
            let table = document.querySelector('tbody');
            table.innerHTML = '';
    
            students.forEach(student => {
                studentManager.addToTable(student);
            });
        }

        addToTable(student) {
            let tbody = document.querySelector('tbody');
    
            let tr = document.createElement('tr');
            let tdName = document.createElement('td');
            let tdSurname = document.createElement('td');
            let tdMiddleName = document.createElement('td');
            let tdBirthDate = document.createElement('td');
            let tdStartDate = document.createElement('td');
            let tdFaculty = document.createElement('td');
    
    
            tdName.textContent = student.name;
            tdSurname.textContent = student.surname;
            tdMiddleName.textContent = student.middleName;
            tdBirthDate.textContent = student.birthDate;
            tdStartDate.textContent = student.studyStartDate;
            tdFaculty.textContent = student.faculty;
    
            tr.appendChild(tdName);
            tr.appendChild(tdSurname);
            tr.appendChild(tdMiddleName);
            tr.appendChild(tdBirthDate);
            tr.appendChild(tdStartDate);
            tr.appendChild(tdFaculty);
    
            tbody.appendChild(tr);
        }
    }

    class Helpers {
        clearInputs() {
            let form = document.querySelector('.students__form');
            let inputs = form.querySelectorAll('input');
    
            inputs.forEach(input => {
                input.value = '';
            });
        }

        yearsDeclension(years) {
            if (years % 10 === 1 && years % 100 !== 11) {
                return years + " год";
            } else if (years % 10 >= 2 && years % 10 <= 4 && (years % 100 < 10 || years % 100 >= 20)) {
                return years + " года";
            } else {
                return years + " лет";
            }
        }

        setLocalStorage(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }
    
        getLocalStorage(key) {
            let data = localStorage.getItem(key);
            data = data ? JSON.parse(data) : [];
            return data;
        }
    }

    class Events {
        setSubmitEvent() {
            let submit = document.querySelector('.students__submit');
            submit.addEventListener('click', (e) => {
                e.preventDefault();
    
                let student = studentManager.create();
    
                let v = studentManager.verify(student);
    
                let res = studentManager.addToStorage(student);
    
                let err = document.querySelector('.students__err');
    
                if (v.length !== 0) {
                    err.textContent = v;
                    return;
                }
    
                if (res === 'already exists') {
                    err.textContent = 'Студент уже добавлен в таблицу';
                    return;
                }
    
                studentManager.addToTable(student);
    
                err.textContent = '';
                helpers.clearInputs();
            });
        }
    
        handleFieldClick(fieldId, compareFunction) {
            let field = document.querySelector(fieldId);
            field.addEventListener('click', (e) => {
    
                let students = helpers.getLocalStorage(LOCAL_STORAGE_KEY);
                
                let dataId = e.target.dataset.id;
                if (dataId === 'random' || dataId === 'down') {
                    e.target.dataset.id = 'up';
                    students.sort(compareFunction);
                } else {
                    e.target.dataset.id = 'down';
                    students.sort((a, b) => compareFunction(b, a));
                }
                
                helpers.setLocalStorage(LOCAL_STORAGE_KEY, students);
                studentManager.getAll();
            });
        }
    
        setTableFilterEvent() {
    
            let nameHandler = function (a, b) {
                let fullnameA = [a.name, a.surname, a.middleName].join(' ');
                let fullnameB = [b.name, b.surname, b.middleName].join(' ');
                return fullnameA.localeCompare(fullnameB);
            }
    
            events.handleFieldClick('#field_name', (a, b) => nameHandler(a, b));
            events.handleFieldClick('#field_surname', (a, b) => nameHandler(a, b));
            events.handleFieldClick('#field_middlename', (a, b) => nameHandler(a, b));
            events.handleFieldClick('#field_faculty', (a, b) => a.faculty.localeCompare(b.faculty));
    
    
            events.handleFieldClick('#field_birth_date', (a, b) => {
                const partsA = a.birthDate.split(' ')[0].split('.'); // 22.11.2009 (14 лет) => 22.11.2009 => ['22', '11', '2009']
                const partsB = b.birthDate.split(' ')[0].split('.');
    
                const dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]); // создаем Date
                const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
    
                return dateA - dateB;
            });
    
            events.handleFieldClick('#field_study_start', (a, b) => {
                const startYearA = parseInt(a.studyStartDate.split('-')[0]); // получаем первый год, разделив "-"
                const startYearB = parseInt(b.studyStartDate.split('-')[0]);
    
                const dateA = new Date(startYearA, 0, 1); 
                const dateB = new Date(startYearB, 0, 1);
    
                return dateA - dateB;
            });
        }
    
        setInputEvent() {
            let form = document.querySelector('.students__form');
            let inputs = form.querySelectorAll('input');
    
            inputs.forEach(input => {
                switch (input.id) {
                    case 'name':
                        input.addEventListener('input', (e) => {
                            let name = e.target.value.trim();
    
                            let students = helpers.getLocalStorage(LOCAL_STORAGE_KEY);
                            if (name === '') {
                                studentManager.getAll(students);
                                return;
                            }
    
                            students = students.filter(student => {
                                let fullname = [student.name, student.surname, student.middleName].join(' ');
                                return fullname.includes(name);
                            });
    
                            studentManager.getAll(students);
                        });
                        break;
                    case 'date':
                        input.addEventListener('input', (e) => {
                            let birthDate = e.target.valueAsDate;
                            let students = helpers.getLocalStorage(LOCAL_STORAGE_KEY);
    
                            if (e.target.value === '') {
                                studentManager.getAll(students);
                                return;
                            }
    
    
                            students = students.filter(student => {
                                let birthDate2 = studentManager.getBirthDate(birthDate);
                                return birthDate2 === student.birthDate;
                            });
    
                            studentManager.getAll(students);
                        });
                        break;
                    case 'year':
                        input.addEventListener('input', (e) => {
                            let year = e.target.value;
                    
                            let students = helpers.getLocalStorage(LOCAL_STORAGE_KEY);
    
                            if (year === '') {
                                studentManager.getAll(students);
                                return;
                            }
    
                            students = students.filter(student => {
                                let year1 = parseInt(student.studyStartDate.split('-')[0])
                                return Number(year) === year1;
                            });
    
                            studentManager.getAll(students);
                        });
                        break;
                    case 'end-year':
                        input.addEventListener('input', (e) => {
                            let year = e.target.value;
                            let students = helpers.getLocalStorage(LOCAL_STORAGE_KEY);
    
                            if (year === '') {
                                studentManager.getAll(students);
                                return;
                            }
    
                            students = students.filter(student => {
                                let year1 = parseInt(student.studyStartDate.split('-')[1])
                                return Number(year) === year1;
                            });
    
                            studentManager.getAll(students);
                        });
                        break;
                    case 'faculty':
                        input.addEventListener('input', () => {
                            let faculty = input.value.trim();
                            let students = helpers.getLocalStorage(LOCAL_STORAGE_KEY);
    
                            if (faculty === '') {
                                studentManager.getAll(students);
                                return;
                            }
                            students = students.filter(student => student.faculty.includes(faculty)
                            );
    
                            studentManager.getAll(students);
                        });
                        break;
                }
            })
        }
    }


    const LOCAL_STORAGE_KEY = 'students';

    const studentManager = new StudentManager();
    const helpers = new Helpers();
    const events = new Events();

    events.setTableFilterEvent();
    events.setInputEvent();
    events.setSubmitEvent();
    studentManager.getAll();
})();